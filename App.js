import React from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';


function format(centis) {
  const hours = Math.floor(centis / (100 * 60 * 60)).toString();
  const minutes = Math.floor(centis % (100 * 60 * 60) / (100 * 60)).toString();
  const seconds = (centis % (100 * 60) / 100).toFixed(2);

  if (hours !== '0') {
    return hours + ':' +
    (minutes.length === 1 ? '0' : '') +
    minutes + ':' +
    (seconds.length === 4 ? '0' : '') +
    seconds;
  } else if (minutes !== '0') {
    return minutes + ':' +
    (seconds.length === 4 ? '0' : '') +
    seconds;
  } else {
    return seconds;
  }
}

function currentDatetime() {
  let d = new Date();
  let s = d.toISOString();
  return s.replace('T', ' ').slice(0, -2);
}

class Results extends React.Component{
  constructor(props){
    super(props);
  }

  render() {
    return <View style={styles.container}>
      <Text>Here are your results:</Text>
        <FlatList
          data={this.props.results}
          renderItem={({item}) => <Text>{format(item.centis)}</Text>}
          keyExtractor={(item, index) => item.datetime}
          />
      <Text>Res</Text>
      <Text>2Res</Text>
    </View>
  }

}

class Time extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      running: false,
      timeState: styles.usual,
      centis: 0
    };

    this.keydown = this.keydown.bind(this);
    this.keyup = this.keyup.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.onTouchStartHandler = this.keydown;
  }

  start() {
    this.setState({
      running: true,
      startTime: Date.now()
    });

    this.timerId = setInterval(
      () => this.tick(), 9);
    this.onTouchStartHandler = () => {};
    this.props.setGlobalTouch(this.keydown);
  }

  stop() {
    const res = Math.floor((Date.now() - this.state.startTime) / 10);
    clearInterval(this.timerId);
    this.props.saveResult({
      centis: res,
      scramble: this.props.scramble,
      penalty: false,
      datetime: currentDatetime()
    });
    this.setState({
      centis: res,
      running: false
    });
    this.onTouchStartHandler = this.keydown;
    this.props.setGlobalTouch(() => {});
  }

    keydown(e) {
      e.preventDefault();
      if (this.state.running) {
        this.stop();
      } else if (isNaN(this.timeoutId)) {
        this.setState({
          timeState: styles.notReady
        });
        this.timeoutId = setTimeout(() => {
          this.setState({
            timeState: styles.ready
          });
        }, 300);
      }
    }

    keyup(e) {
      if (!this.state.running) {
        if (this.state.timeState === styles.ready) {
          this.start()
        }
        clearTimeout(this.timeoutId);
        this.timeoutId = NaN;

        this.setState({
          timeState: styles.usual
        });
      }
    }

    tick() {
      this.setState({
        centis: Math.floor((Date.now() - this.state.startTime) / 10)
      });
    }

    render() {
      return <View style={[styles.container, {backgroundColor: 'powderblue'}]} onTouchStart={this.onTouchStartHandler} onTouchEnd={this.keyup}>
        <Text>Your time is</Text>
        <Text style={this.state.timeState}>{format(this.state.centis)}</Text>
        <Text>You are so cool!</Text>
      </View>
    }
  }

class Timer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {onTouchStart: () => {},
    results: []};
      this.setGlobalTouch = this.setGlobalTouch.bind(this);
    }

    setGlobalTouch(handler) {
      this.setState({
        onTouchStart: handler
      });
    }

    render() {
      return (
        <View style={[styles.container,{alignItems: 'stretch'}]} onTouchStart={this.state.onTouchStart}>
          <Time saveResult={this.props.saveResult} setGlobalTouch={this.setGlobalTouch}/>
          <View style={styles.container}>
            <Text>Scramble</Text>
          </View>
        </View>
      );
    }
  }

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.saveResult = this.saveResult.bind(this);

    this.timer = <Timer saveResult={this.saveResult}/>

    this.state = {
      activeView: this.timer,
      results: [],
    }

    this.results = <Results results={this.state.results}/>
    // this.results = <View><Text>Lol</Text></View>
  }

  saveResult(result) {
    this.setState(previousState => ({
      results: [...previousState.results, result]
    }))
    this.results = <Results results={this.state.results}/>
  }

  setActive(activeView) {
    this.setState({
      activeView: activeView
    })
  }

  render() {
    return <View style={styles.container}>
      {this.state.activeView}
      <View style={{flexDirection: 'row'}}>
        <Text onTouchStart={() => this.setActive(this.timer)}>Timer</Text>
        <Text onTouchStart={() => this.setActive(this.results)}>Results</Text>
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
  notReady: {
    color: '#f00',
  },
  ready: {
    color: '#0f0',
  },
  usual: {
    color: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

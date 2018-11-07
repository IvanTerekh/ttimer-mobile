import React from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {currentDatetime, format} from './util';
import {updateStats, calcStats, avgs} from './stats';

class Stats extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    return <View>
      <Text>Avg: {format(this.props.stats.avg)}</Text>
      <Text>Solves: {this.props.stats.n}</Text>
      <FlatList
        data={avgs}
        renderItem={({item}) => {if (this.props.stats.n < item){
          return null
        } else {
          return <View>
           <Text>Best{item}: {format(this.props.stats[item].best)}</Text>
           <Text>Current{item}: {this.props.stats[item].current}</Text>
          </View>
        }}}
        keyExtractor={(item, index) => item}
        extraData={this.props.stats}
      />
    </View>
  }
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
        <Text>Trololo</Text>
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
            <Stats stats={this.props.stats}></Stats>
          </View>
        </View>
      );
    }
  }

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeScreen: 'timer',
      results: [],
      stats: calcStats([])
    }

    this.saveResult = this.saveResult.bind(this);
  }

  saveResult(res) {
    this.setState(state => {
      const allResults = [...state.results, res];
      return {
        stats: updateStats(state.stats, allResults),
        results: allResults
      }
    });
  }

  setActive(activeScreen) {
    this.setState({
      activeScreen: activeScreen
    });
  }

  render() {
    let screen;
    switch (this.state.activeScreen) {
      case 'timer':
        screen = <Timer saveResult={this.saveResult} stats={this.state.stats}/>
        break;
      case 'results':
        screen = <Results results={[]} stats={this.stats}/>
        break;
      default:
    }

    return <View style={styles.container}>
      {screen}
      <View style={{flexDirection: 'row', height: 50}}>
        <Icon onTouchStart={() => this.setActive('timer')} name="timer" size={30} color="#233" />
        <Icon onTouchStart={() => this.setActive('results')} name="format-list-bulleted" size={30} color="#233" />
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

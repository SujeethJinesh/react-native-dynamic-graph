/* @flow */
import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { connect } from 'react-redux';
import startOfDay from 'date-fns/start_of_day';

import type { Forecast, DateChangeHandler, CustomConfig } from '../types';
import { DateSelector } from '../components/DateSelector';
import { HourlyChart } from '../components/HourlyChart';

type DateInfo = {
  candidates: Date[],
  weather: Forecast[]
};

type Props = {
  today: Date,
  past: DateInfo,
  future: DateInfo,
  onFutureChange: DateChangeHandler,
  onPastChange: DateChangeHandler,
  customConfig: CustomConfig
};

function Main({
  today,
  past,
  future,
  onPastChange,
  onFutureChange,
  customConfig
}: Props) {
  const temperatures = past.weather.concat(future.weather).map(f => f.temperature);
  const minTemperature = temperatures.length > 0 ? Math.min(...temperatures) : null;
  const maxTemperature = temperatures.length > 0 ? Math.max(0, ...temperatures) : null;
  
  return <View style={styles.container}>
    <HourlyChart
      past={past.weather}
      future={future.weather}
      minTemperature={minTemperature}
      maxTemperature={maxTemperature}
      style={[styles.chart]}
      customConfig={customConfig}
    />
    <View style={styles.footer}>
      <DateSelector
        candidates={future.candidates}
        onChange={onFutureChange}
        today={today}
        textStyle={{ color: '#ff6666cc' }}
      />
      <Text style={[styles.vs]}>×</Text>
      <DateSelector
        candidates={past.candidates}
        onChange={onPastChange}
        today={today}
        textStyle={{ color: '#889988dd' }}
      />
    </View>
  </View>;
}

const stateToProps = state => state;
const dispatchToProps = dispatch => ({
  onPastChange(date: Date): void {
    dispatch({ type: 'PAST_DATE_CHANGED', payload: date });
  },
  onFutureChange(date: Date): void {
    dispatch({ type: 'FUTURE_DATE_CHANGED', payload: date });
  }
});
Main = connect(stateToProps, dispatchToProps)(Main);
export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  header: {
    flex: 1,
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1.2,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems  : 'center'
  },
  vs: {
    color: '#88998899',
    fontSize: 20
  }
});

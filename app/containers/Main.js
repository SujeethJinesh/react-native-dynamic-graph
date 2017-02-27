/* @flow */
import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { connect } from 'react-redux';
import startOfDay from 'date-fns/start_of_day';

import type { CustomConfig } from '../types';
import { HourlyChart } from '../components/HourlyChart';

type Props = {
  customConfig: CustomConfig
};

function Main({
  customConfig
}: Props) {
  const temperatures = customConfig.heights; //past.weather.concat(future.weather).map(f => f.temperature)
  const minTemperature = temperatures.length > 0 ? Math.min(...temperatures) : null;
  const maxTemperature = temperatures.length > 0 ? Math.max(0, ...temperatures) : null;
  
  return <View style={styles.container}>
    <HourlyChart
      minTemperature={minTemperature}
      maxTemperature={maxTemperature}
      style={[styles.chart]}
      customConfig={customConfig}
    />
  </View>;
}

const stateToProps = state => state;
const dispatchToProps = dispatch => ({
  onPastChange(date: Date): void {
    dispatch({ type: 'PAST_DATE_CHANGED', payload: date });
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
  }
});

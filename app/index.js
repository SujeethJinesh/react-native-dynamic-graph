/* @flow */
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import { createEpicMiddleware } from 'redux-observable';
import createLogger from 'redux-logger';

import reducers from './reducers';
import epic from './epic';
import Main from './containers/Main';

const store = createStore(
  combineReducers(reducers),
  applyMiddleware(
    createEpicMiddleware(epic),
    createLogger()
  )
);
store.dispatch({ type: 'APP_INIT' });

function Compare() {
  return <Provider store={store}>
    <Main customConfig={{height: 250, width: 200, heights: [12,20,30,41,250, 12, 213, 123, 65], color: '#00a1ff'}}/>
  </Provider>;
}

AppRegistry.registerComponent('Compare', () => Compare);

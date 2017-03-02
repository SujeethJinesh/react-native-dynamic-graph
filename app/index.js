/* @flow */
import React, { Component } from 'react';
import { AppRegistry, View } from 'react-native';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import { createEpicMiddleware } from 'redux-observable';
import createLogger from 'redux-logger';

import reducers from './reducers';
import epic from './epic';
import Main from './containers/Main';


// const store = createStore(
//   combineReducers(reducers),
//   applyMiddleware(
//     createEpicMiddleware(epic),
//     createLogger()
//   )
// );
// store.dispatch({ type: 'APP_INIT' });

class Graph extends Component {

  // store = createStore(
  //     combineReducers(reducers),
  //     applyMiddleware(
  //       createEpicMiddleware(epic),
  //       createLogger()
  //     )
  // ).dispatch({ type: 'APP_INIT' });

  render() {

      const store = createStore(
      combineReducers(reducers),
      applyMiddleware(
        createEpicMiddleware(epic),
        createLogger()
      )
    );
    store.dispatch({ type: 'APP_INIT' });

    return (
      <Provider store={store}>
      <Main customConfig={this.props.customConfig}/>
    </Provider>
    );
  }
}

//example customConfig = {height: 250, width: 200, heights: [12,200,31,61,25, 120, 213, 123, 65], color: '#ff0000'}

export default Graph;

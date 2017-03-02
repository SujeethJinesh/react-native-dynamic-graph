/* @flow */
import React from 'react';
import { AppRegistry } from 'react-native';
import Graph from './app/index.js';

const Compare = () => (
    <Graph customConfig={{height: 250, width: 200, heights: [12,200,31,61,25, 120, 213, 123, 65], color: '#ff0000'}}>
    </Graph>
);

AppRegistry.registerComponent('Compare', () => Compare);
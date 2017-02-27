/* @flow */
import React, { Component } from 'react';
import {
  StyleSheet,
  Animated,
  ScrollView,
  Text,
  View,
  Image,
  ART
} from 'react-native';
import {
  Path,
  Group,
  Shape,
  Surface,
  Transform
} from 'ReactNativeART';

import { Forecast, CustomConfig } from '../types';
import { aggregate, AnimatedAggregation } from '../animated/AnimatedAggregation';
import Dimensions from 'Dimensions';

const AnimatedGroup = Animated.createAnimatedComponent(Group);
const AnimatedShape = Animated.createAnimatedComponent(Shape);

// heights are for 00:00-23:00.
// To keep enough space to show icons at the screen edge, draw:
// - the previous days' 23:30-24:00 with the value of 00:00.
// - 23:00-23:30 with the value of 23:00.
function areaChartPath(customConfig: CustomConfig, w: number, h: number, heights: number[]) {
  const points = heights.map((height, i) => ({
    x: (i) * customConfig.width/customConfig.heights.length,
    y: h-height //Math.floor(h - height + h/height)
  }));
  // http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
  let i = 0;
  let path = Path().moveTo(0, h)
    .lineTo(0, points[i].y)
    .lineTo(points[i].x, points[i].y);
  for (i = 1; i < customConfig.heights.length - 2; i++) {
    const p = points[i];
    const q = points[i + 1];
    const xc = (p.x + q.x) / 2;
    const yc = (p.y + q.y) / 2;
    path = path.curveTo(p.x, p.y, xc, yc);
  }
  path = path
    .curveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
    .lineTo(w, points[i + 1].y);
  return path.lineTo(w, h).close();
}

type AnimatedPath<T> = {
  heights: Animated.Value[],
  path: AnimatedAggregation<T>
};

function buildAnimatedPath(customConfig: CustomConfig): AnimatedPath<*> {
  const animatedHeights = Array.from(Array(customConfig.heights.length))
    .map(() => new Animated.Value(0));
  const animatedPath = aggregate(
    animatedHeights,
    heights => areaChartPath(customConfig, customConfig.width, customConfig.height, heights)
  );
  return {
    heights: animatedHeights,
    path: animatedPath
  };
}

function springPath(customConfig: CustomConfig,  animatedPath: AnimatedPath<*>, minTemperature: number, maxTemperature: number, forecasts: Forecast[]): void {
  const heights = customConfig.heights;
  const anims = animatedPath.heights.map((ah, i) => {
    return Animated.spring(ah, {
      toValue: heights[i],
      friction: 3,
      tension: 50
    });
  });
  Animated.parallel(anims).start();
}

export class HourlyChart extends Component {
  state: {
    future: AnimatedPath<*>
  };

  constructor(props: Props) {
    super();
    this.state = {
      future: buildAnimatedPath(props.customConfig)
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    // TODO: We need more stable min/max tempertures.
    // Otherwise min/max temperature's change makes unchnaged date's chart move.
      springPath(this.props.customConfig, this.state.future, nextProps.minTemperature, nextProps.maxTemperature);
  }

  render() {
    const { past, future, style } = this.props;
    const CHART_HEIGHT = this.props.customConfig.height;
    const CHART_WIDTH = this.props.customConfig.width;
    const customConfig = this.props.customConfig;

    const areaChart = <View style={[{ width: CHART_WIDTH, height: CHART_HEIGHT, position: 'absolute', top: 0 }]}>
      <Surface width={CHART_WIDTH} height={CHART_HEIGHT} style={[{ backgroundColor: '#00000000' }]}>
        <AnimatedShape fill={customConfig.color} d={this.state.future.path} />
      </Surface>
    </View>;

    return <View style={[style, styles.container, {height: customConfig.height + 25}, {width: customConfig.width}]}>
      {areaChart}
    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end'
  },
  chartItems: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  }
});

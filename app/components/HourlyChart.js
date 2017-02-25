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

import weatherIcons from '../icons';
import { Forecast } from '../types';
import { aggregate, AnimatedAggregation } from '../animated/AnimatedAggregation';
import Dimensions from 'Dimensions';

const CHART_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 250;
const UNIT_SIZE = CHART_WIDTH / 24;
const ICON_SIZE = UNIT_SIZE * 1.6;

const AnimatedGroup = Animated.createAnimatedComponent(Group);
const AnimatedShape = Animated.createAnimatedComponent(Shape);

type Props = {
  past: Forecast[],
  future: Forecast[],
  minTemperature: number,
  maxTemperature: number,
  style: StyleSheet
};

type WeatherRange = {
  icon: string,
  start: number,
  end: number
};

function makeRanges(forecasts: Forecast[]): WeatherRange[] {
  const ranges = forecasts.reduce((acc, item, i) => {
    if (i === 0) {
      acc.push({ icon: item.icon, start: i, end: i });
    } else {
      const last = acc[acc.length - 1];
      if (i % 2 === 1 || last.icon === item.icon) {
        last.end = i;
      } else {
        acc.push({ icon: item.icon, start: i, end: i });
      }
    }
    return acc;
  }, []);
  return ranges;
}

function calcHeight(minTemperature: number, maxTemperature: number, temperature: number): number {
  const ratio = (temperature - minTemperature) / (maxTemperature - minTemperature);
  return CHART_HEIGHT * (ratio * 0.6 + 0.1);
}





// heights are for 00:00-23:00.
// To keep enough space to show icons at the screen edge, draw:
// - the previous days' 23:30-24:00 with the value of 00:00.
// - 23:00-23:30 with the value of 23:00.
function areaChartPath(w: number, h: number, heights: number[]) {
  const points = heights.map((height, i) => ({
    x: (0.5 + i) * UNIT_SIZE,
    y: h - height
  }));
  // http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
  let i = 0;
  let path = Path().moveTo(0, h)
    .lineTo(0, points[i].y)
    .lineTo(points[i].x, points[i].y);
  for (i = 1; i < 24 - 2; i++) {
    const p = points[i];
    const q = points[i + 1];
    const xc = (p.x + q.x) / 2;
    const yc = (p.y + q.y) / 2;
    path = path.curveTo(p.x, p.y, xc, yc);
  }
  path = path
    .curveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
    .lineTo(CHART_WIDTH, points[i + 1].y);
  return path.lineTo(w, h).close();
}

type AnimatedPath<T> = {
  heights: Animated.Value[],
  path: AnimatedAggregation<T>
};

function buildAnimatedPath(): AnimatedPath<*> {
  const animatedHeights = Array.from(Array(24))
    .map(() => new Animated.Value(0));
  const animatedPath = aggregate(
    animatedHeights,
    heights => areaChartPath(CHART_WIDTH, CHART_HEIGHT, heights)
  );
  return {
    heights: animatedHeights,
    path: animatedPath
  };
}

function springPath(animatedPath: AnimatedPath<*>, minTemperature: number, maxTemperature: number, forecasts: Forecast[]): void {
  const heights = forecasts.map(f => calcHeight(minTemperature, maxTemperature, f.temperature));
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
    future: AnimatedPath<*>,
    past: AnimatedPath<*>,
  };

  constructor(props: Props) {
    super();
    this.state = {
      future: buildAnimatedPath(),
      past: buildAnimatedPath()
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    // TODO: We need more stable min/max tempertures.
    // Otherwise min/max temperature's change makes unchnaged date's chart move.
    if (this.props.future !== nextProps.future || this.props.past !== nextProps.past) {
      springPath(this.state.future, nextProps.minTemperature, nextProps.maxTemperature, nextProps.future);
      springPath(this.state.past, nextProps.minTemperature, nextProps.maxTemperature, nextProps.past);
    }
  }

  render() {
    const { past, future, style } = this.props;

    const labels = past.slice(0, 12).map((h, i) => (
      <Text key={i} style={[styles.hourLabel]}>{i * 2}</Text>
    ));

    const areaChart = <View style={[{ width: CHART_WIDTH, height: CHART_HEIGHT, position: 'absolute', top: 0 }]}>
      <Surface width={CHART_WIDTH} height={CHART_HEIGHT} style={[{ backgroundColor: '#00000000' }]}>
        <AnimatedShape fill="#99999944" d={this.state.past.path} />
        <AnimatedShape fill="#ff666666" d={this.state.future.path} />
      </Surface>
    </View>;

    const ranges = makeRanges(future);

    return <View style={[style, styles.container]}>
      {areaChart}
      <View style={styles.chartItems}>{labels}</View>
    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT + 25,
    justifyContent: 'flex-end'
  },
  chartItems: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  hourLabel: {
    textAlign: 'center',
    marginTop: 4,
    marginRight: 9,
    width: UNIT_SIZE * 2 - 9,
    fontWeight: 'bold',
    color: '#99999988',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE
  }
});

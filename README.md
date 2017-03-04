## Usage
```js
npm install react-native-dynamic-graph
```

To change parameters like the height, width, values, and color, edit them in ./app/index.js under the Main Component's props.

Import:

```js
import Graph from 'react-native-dynamic-graph';
```

```js
<Graph customConfig={{height: 250, width: 200, heights: [12,200,31,61,25, 120, 213, 123, 65], color: '#ff0000'}}/>
```

## Thanks

- [Shuhei](https://github.com/shuhei) For open source-ing his graphs

## Known Issues/TODOs

1) Does not work for negative numbers.
2) Geolocation runs in background.
3) Heights do not scale to passed in height.

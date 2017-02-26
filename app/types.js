export type Forecast = {
  time: number,
  temperature: number,
  windBearing: number,
  windSpeed: number,
  summary: ?string,
  icon: ?string
};

export type Coords = {
  lat: number,
  lng: number
};

export type Action = {
  type: string,
  payload: any
};

export type CustomConfig = {
  height: Number,
  width: Number,
  heights: React.PropTypes.array,
  color: React.PropTypes.string
};

export type ChangeHandler = (date: Date) => void;

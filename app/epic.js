/* @flow */
import { LayoutAnimation } from 'react-native';
import type { MiddlewareAPI } from 'redux';
import { ActionsObservable } from 'redux-observable';
// FIXME: Importing from 'rxjs' to make flow check types. This bundles everything from rxjs.
import { Observable } from 'rxjs';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/observable/fromPromise';
// import 'rxjs/add/observable/merge';
// import 'rxjs/add/observable/combineLatest';
// import 'rxjs/add/observable/empty';

import type {
  Action
} from './types';
import type { State } from './reducers';

export default function (action$: ActionsObservable<Action>, store: MiddlewareAPI<State, Action>): Observable<Action> {
  //remove geolocation from here, cause of bottleneck
  const locationCoords$ = action$.ofType('APP_INIT')
    .mergeMap(() => Observable.fromPromise(getLocation()))
    .map(coords => ({ type: 'LOCATION_COORDS_CHANGED', payload: coords }));

  return Observable.merge(
    locationCoords$
  ).do(() => LayoutAnimation.spring());
}

function getLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      resolve({
        lat: 35.699069,
        lng: 139.7728588
      });
    }, error => {
      // Akihabara for dummy location.
      resolve({
        lat: 35.699069,
        lng: 139.7728588
      });
    });
  });
}
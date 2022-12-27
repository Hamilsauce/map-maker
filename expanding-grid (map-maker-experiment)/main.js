import { MapView } from './js/rx-map.view.js';
import { getStore } from '../store/rx-store.js';
import { initMapOptions } from '../view/map-options.view.js';
const { combineLatest, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, startWith, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const appHeader = document.querySelector('#app-header')
const containers = document.querySelectorAll('.container')

appHeader.innerHTML = '';

const unsubscribeMapOptions = initMapOptions(appHeader)

// const mapOptions = {
//   width: document.querySelector('#width-input'),
//   height: document.querySelector('#height-input'),
//   scale: document.querySelector('#scale-input'),
// }

// const store = getStore();

const mapView = new MapView();

appBody.append(mapView.dom);

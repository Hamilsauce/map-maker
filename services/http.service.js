import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class HttpService {
  constructor() {}

  async fetch(url, type = 'json') {
    return await (await fetch(url)).json();
  }

  fetch$(url, type = 'json') {
    return fromFetch(url).pipe(
      mergeMap(res => from(res.json())),
    );
  }
}
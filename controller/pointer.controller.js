import { Controller } from '../lib/controller.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class PointerController extends Controller {
  constructor({ view, model }) {
    super('pointer', { view, model });
  }
  
  // createEventStream() {}


  get prop() { return this._prop };
  
  set prop(newValue) { this._prop = newValue };
}

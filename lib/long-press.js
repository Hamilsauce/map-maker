import './style.css';
import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { of } from 'rxjs/observable/of';
import { tap, delay, mergeMap, map, filter, takeUntil } from 'rxjs/operators';

const button = document.getElementById('button');
const result = document.getElementById('result');

const mouseDown$ = fromEvent(button, 'mousedown');
const mouseUp$ = fromEvent(button, 'mouseup');

// long press 2 seconds
const longpress$ = mouseDown$.pipe(
  mergeMap((e) => {
    return of(e).pipe(
      delay(2000),
      takeUntil(mouseUp$),
    );
  }),
);

longpress$.pipe(
  tap(() => updateResult('longpress')),
  delay(2000),
).subscribe((event) => clearResult());

const updateResult = (type) => {
  result.innerHTML += `<p>${type}しちゃったね</p>`;
}

const clearResult = () => {
  result.innerHTML = '';
}

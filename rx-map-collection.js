const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


const tileMap = new Map([
  ['0,0', { value: 1 }],
  ['1,0', { value: 2 }],
  ['2,0', { value: 3 }],
])

const map$ = from(tileMap);
const mapSubject$ = new Subject();

map$.pipe(
  map(x => x),
  // tap(x => console.warn('[MAP SET]', x))
)

map$.subscribe(mapSubject$);

mapSubject$.asObservable().pipe(
  map(x => x),
  tap(x => console.warn('mapSubject$', x))
).subscribe();

const createEntry = (i) => {
  return [i + '0', { value: i }]
}


let cnt = 0

setInterval(() => {
  tileMap.set(...createEntry(++cnt))
  console.log([...tileMap]);
}, 1000)
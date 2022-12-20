const { fromEvent } = rxjs;
const { map, filter, debounceTime, buffer } = rxjs.operators;

export const getClicks$ = (target) => {
  const mouse$ = fromEvent(target, 'click')

  const buff$ = mouse$.pipe(debounceTime(200))

  const bufferedClicks$ = mouse$.pipe(
    buffer(buff$),
    map(list => list)
  );

  return {
    click$: bufferedClicks$.pipe(
      filter(x => x.length === 1),
    ),
    dblClick$: bufferedClicks$.pipe(
      filter(x => x.length === 2),
    ),
  }
}
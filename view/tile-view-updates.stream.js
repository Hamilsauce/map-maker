const { Subject } = rxjs;

const tileUpdates$ = new Subject();

export const push = (updates) => {
  tileUpdates$.next(updates);
};

export const getStream = () => {
  return tileUpdates$.asObservable();
};
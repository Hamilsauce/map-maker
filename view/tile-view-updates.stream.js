const { Subject } = rxjs;

const tileUpdates$ = new Subject();

 const push = (updates) => {
  tileUpdates$.next(updates);
};

 const getStream = () => {
  return tileUpdates$.asObservable();
};

export const tileViewEvents = {
  push, 
  getStream
}
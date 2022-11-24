export const defineStream = () => {
  
  
};

const defineState = ({ state, getters, actions }) => {
  const stateSubject$ = new BehaviorSubject({
      state,
      getters,
      actions
    })
    .pipe(
      distinctUntilChanged(),
      tap(x => console.log('tileBrushSubject$', x))
    );
};

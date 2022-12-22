const { BehaviorSubject } = rxjs
const { distinctUntilChanged, map } = rxjs.operators;

export  class Store extends BehaviorSubject {
  constructor(initialState) {
    super(initialState);
  }

   dispatch(fn = (state) => {}) {
    this.next(fn(this.getValue()));
  }

   select(fn = (state) => {}) {
    return this.pipe(map(fn), distinctUntilChanged());
  }

   selectSync(fn = (state) => {}) {
    return fn(this.getValue());
  }
}

// import { User } from "../entity/user";
// import { Store } from "../../store";

// export interface State {
//   currentUser: User | null;
// }

export class UserStore extends Store {
  constructor() {
    super({
      currentUser: null
    });
  }

  get currentUser$() {
    return this.select(state => state.currentUser);
  }
  get currentUser() {
    return this.selectSync(state => state.currentUser);
  }

  setCurrentUser(user) {
    this.dispatch(state => ({
      ...state,
      currentUser: user
    }));
  }
}
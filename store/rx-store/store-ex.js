const state2 = {name: 'Anna', age: 27};

const store = new BehaviorSubject(state1);

const v1 = getValueFromStore();
console.log(v1.name); // 'James'

updateStore(state2);

const v2 = getValueFromStore();
console.log(v2.name); // 'Anna'

selectFromStore((state) => state.age).subscribe((v) => console.log(v));

function updateStore(v) {
   store.next(v);
}

function getValueFromStore() {
   return store.value;
}

function selectFromStore(selector) {
   return store.asObservable().pipe(
       map(selector)
   );
}

const ra = require('./redux_actions');
createCalcStore = ra.createCalcStore;

test('addition', () => {
  store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: '+'});
  expect(store.getState().x.toNumber()).toBe(7);
});

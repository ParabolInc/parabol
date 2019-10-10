import {applyMiddleware, compose, createStore} from 'redux'
import makeReducer from './redux/makeReducer'

export default (initialState) => {
  let store
  const reducer = makeReducer()
  /*
   * Special action types, such as thunks, must be placed before
   * storageMiddleware so they can be properly interpreted:
   */
  const middlewares = []

  if (__PRODUCTION__) {
    store = createStore(reducer, initialState, compose(applyMiddleware(...middlewares)))
  } else {
    store = createStore(reducer, initialState, compose(applyMiddleware(...middlewares)))
  }
  return store
}

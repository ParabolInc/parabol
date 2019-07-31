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
    const devtoolsExt =
      global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__({maxAge: 50})
    store = createStore(
      reducer,
      initialState,
      compose(
        applyMiddleware(...middlewares),
        devtoolsExt || ((f) => f)
      )
    )
  }
  return store
}

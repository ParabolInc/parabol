import {applyMiddleware, compose, createStore} from 'redux'
import thunkMiddleware from 'redux-thunk'
import makeReducer from 'universal/redux/makeReducer'
import {APP_VERSION_KEY} from 'universal/utils/constants'

export default (initialState) => {
  let store
  const reducer = makeReducer()
  /*
   * Special action types, such as thunks, must be placed before
   * storageMiddleware so they can be properly interpreted:
   */
  const middlewares = [thunkMiddleware]

  if (__PRODUCTION__) {
    store = createStore(reducer, initialState, compose(applyMiddleware(...middlewares)))
  } else {
    const devtoolsExt =
      global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__({maxAge: 50})
    store = createStore(
      reducer,
      initialState,
      compose(applyMiddleware(...middlewares), devtoolsExt || ((f) => f))
    )
  }
  window.localStorage.setItem(APP_VERSION_KEY, __APP_VERSION__) // eslint-disable-line no-undef
  return store
}

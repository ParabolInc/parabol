import {combineReducers} from 'redux'
import makeRootReducer from './rootDuck'

const appReducers = {
  noop: (state = null) => state
}

export default (newReducers) => {
  Object.assign(appReducers, newReducers)
  const appReducer = combineReducers({...appReducers})
  return makeRootReducer(appReducer)
}

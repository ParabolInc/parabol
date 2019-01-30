import {combineReducers} from 'redux'
import makeRootReducer from 'universal/redux/rootDuck'

const appReducers = {}

export default (newReducers) => {
  Object.assign(appReducers, newReducers)
  const appReducer = combineReducers({...appReducers})
  return makeRootReducer(appReducer)
}

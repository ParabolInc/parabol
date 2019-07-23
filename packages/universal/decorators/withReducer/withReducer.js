import React, {Component} from 'react'
import makeReducer from 'universal/redux/makeReducer'
import {store} from 'client/client'

export default (reducerObj) => (ComposedComponent) => {
  class WithReducer extends Component {
    componentWillMount () {
      const newReducers = makeReducer(reducerObj)
      store.replaceReducer(newReducers)
    }

    render () {
      return <ComposedComponent {...this.props} />
    }
  }
  return WithReducer
}

import './cdnFallback'
import React from 'react'
import {render} from 'react-dom'
import makeStore from './makeStore'
import Root from './Root'
import './scrollIntoViewIfNeeded'
// do this here so useBuiltIns can replace it with only the polyfills required to hit browser targets
import '@babel/polyfill'
import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: window.__ACTION__.sentry
})

const initialState = {}
export const store = makeStore(initialState)
render(<Root store={store} />, document.getElementById('root'))

if (module.hot) {
  module.hot.accept('./Root', () => {
    const Root = require('./Root').default
    render(<Root store={store} />, document.getElementById('root'))
  })
}

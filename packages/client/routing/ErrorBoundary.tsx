import * as React from 'react'
import {Component} from 'react'

interface State {
  error: {
    message: string
    source: string
  } | null
}

/**
 * A reusable component for handling errors in a React (sub)tree.
 */
export default class ErrorBoundary extends Component {
  state: State = {error: null}

  static getDerivedStateFromError(error: Error) {
    return {
      error
    }
  }

  render() {
    const {error} = this.state
    if (error) {
      return (
        <div>
          <div>Error: {error.message}</div>
          <div>
            <pre>{JSON.stringify(error.source, null, 2)}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

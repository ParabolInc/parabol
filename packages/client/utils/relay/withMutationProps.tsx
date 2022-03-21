import React, {Component, Ref} from 'react'
import {Subtract} from '../../types/generics'
import getDisplayName from '../getDisplayName'
import getGraphQLError from './getGraphQLError'

export interface ErrorObject {
  [field: string]: string | undefined
}

export interface WithMutationProps {
  dirty: boolean | undefined
  error: ErrorObject | string | undefined
  onCompleted: (res?: any, errors?: any) => void
  onError: (error?: any) => void
  setDirty: () => void
  submitMutation: () => void
  submitting: boolean | undefined
}

export interface MutationServerError {
  message: string
  path: string[]
}

export const formatError = (
  rawError?: string | ErrorObject | MutationServerError | MutationServerError[] | undefined
) => {
  const firstError = Array.isArray(rawError) ? rawError[0] : rawError
  if (typeof firstError === 'object' && 'message' in firstError) {
    return firstError.message
  }
  return firstError
}

// Serves as a lightweight alternative for a form library, best used for single-field forms
const withMutationProps = <P extends WithMutationProps>(
  ComposedComponent: React.ComponentType<P>
) => {
  class MutationProps extends Component<Subtract<P, WithMutationProps>> {
    static displayName = `WithMutationProps(${getDisplayName(ComposedComponent)})`

    _mounted = false

    state = {
      submitting: false,
      error: undefined,
      dirty: false
    }

    componentDidMount() {
      this._mounted = true
    }

    componentWillUnmount() {
      this._mounted = false
    }

    onCompleted = (res: any, errors: any) => {
      const error = getGraphQLError(res, errors)
      if (this._mounted) {
        this.setState({
          submitting: false,
          error: formatError(error)
        })
      }
      return error
    }

    onError = (rawError?: string | MutationServerError | MutationServerError[]) => {
      if (this._mounted) {
        this.setState({
          submitting: false,
          error: formatError(rawError)
        })
      }
    }

    setDirty = () => {
      if (this._mounted && !this.state.dirty) {
        this.setState({dirty: true})
      }
    }

    submitMutation = () => {
      if (this._mounted) {
        this.setState({
          dirty: false,
          submitting: true
        })
      }
    }

    render() {
      const {dirty, error, submitting} = this.state
      // https://github.com/Microsoft/TypeScript/issues/10727
      const {forwardedRef, ...props} = this.props as any
      return (
        <ComposedComponent
          dirty={dirty}
          error={error}
          setDirty={this.setDirty}
          submitting={submitting}
          submitMutation={this.submitMutation}
          onCompleted={this.onCompleted}
          onError={this.onError}
          ref={forwardedRef}
          {...props}
        />
      )
    }
  }
  return React.forwardRef((props: Subtract<P, WithMutationProps>, ref: Ref<any> | undefined) => (
    <MutationProps {...props} forwardedRef={ref} />
  ))
}

export default withMutationProps

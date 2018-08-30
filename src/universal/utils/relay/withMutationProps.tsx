import React, {Component} from 'react'
import {Subtract} from 'types/generics'
import getDisplayName from 'universal/utils/getDisplayName'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'

export interface WithMutationProps {
  dirty?: boolean
  error?: any | undefined
  onCompleted: (res?: any, errors?: any) => void
  onError: (error: any) => void
  setDirty: () => void
  submitMutation: () => void
  submitting?: boolean
}

// Serves as a lightweight alternative for redux-form when we just have a button or something
const withMutationProps = <P extends WithMutationProps>(
  ComposedComponent: React.ComponentType<P>
) => {
  return class WithMutationProps extends Component<Subtract<P, WithMutationProps>> {
    static displayName = `WithMutationProps(${getDisplayName(ComposedComponent)})`

    _mounted: boolean = false

    state = {
      submitting: false,
      error: undefined,
      dirty: false
    }

    componentWillMount() {
      this._mounted = true
    }

    componentWillUnmount() {
      this._mounted = false
    }

    onCompleted = (res, errors) => {
      const error = getGraphQLError(res, errors)
      if (this._mounted) {
        this.setState({
          submitting: false,
          error
        })
      }
      return error
    }

    onError = (error) => {
      if (this._mounted) {
        this.setState({
          submitting: false,
          error
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
          submitting: true
        })
      }
    }

    render() {
      const {dirty, error, submitting} = this.state
      return (
        <ComposedComponent
          {...this.props}
          dirty={dirty}
          error={error}
          setDirty={this.setDirty}
          submitting={submitting}
          submitMutation={this.submitMutation}
          onCompleted={this.onCompleted}
          onError={this.onError}
        />
      )
    }
  }
}

export default withMutationProps

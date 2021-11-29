import React, {Component, Ref} from 'react'
import {Subtract} from '../../types/generics'
import getDisplayName from '../getDisplayName'
import Legitity from '../../validation/Legitity'

export interface WithFormProps {
  setDirtyField: (name?: string) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  validateField(): {[name: string]: Legitity}

  validateField(name: string): Legitity
  fields: FieldState
}

interface FieldInputDict {
  [name: string]: {
    getDefault(props: any): any
    validate(rawInput: any, props: any): Legitity
  }
}

interface Field {
  value: string
  error: string | undefined
  dirty: boolean
}

interface FieldState {
  [name: string]: Field
}

// Serves as a lightweight alternative for a form library, best used for single-field forms
const withForm = (fields: FieldInputDict) => <P extends WithFormProps>(
  ComposedComponent: React.ComponentType<P>
) => {
  class FormProps extends Component<Subtract<P, WithFormProps>> {
    static displayName = `WithForm(${getDisplayName(ComposedComponent)})`
    _mounted = false

    state = {
      fields: Object.keys(fields).reduce((obj, name) => {
        obj[name] = {
          value: fields[name].getDefault(this.props),
          error: undefined,
          dirty: false
        }
        return obj
      }, {} as FieldState)
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const {fields} = this.state
      const {value} = e.target
      const name = e.target.name
      const field = fields[name]
      this.setState(
        {
          fields: {
            ...fields,
            [name]: {
              ...field,
              value
            }
          }
        },
        () => {
          this.validate(name)
        }
      )
    }

    validate = (name?: string) => {
      if (!name) {
        return Object.keys(this.state.fields).reduce((obj, name) => {
          obj[name] = this.validate(name)
          return obj
        }, {})
      }
      const field = this.state.fields[name]
      const {value, error} = field
      const res: Legitity = fields[name].validate(value, this.props)

      if (res.error !== error) {
        this.setState({
          fields: {
            ...this.state.fields,
            [name]: {
              ...field,
              error: res.error
            }
          }
        })
      }
      return res
    }

    setDirty = (name?: string) => {
      if (!name) {
        Object.keys(this.state.fields).forEach((name) => this.setDirty(name))
        return
      }
      const field = this.state.fields[name]
      if (!field?.dirty) {
        this.setState({
          fields: {
            ...this.state.fields,
            [name]: {
              ...field,
              dirty: true
            }
          }
        })
      }
    }

    componentDidMount() {
      this._mounted = true
    }

    componentWillUnmount() {
      this._mounted = false
    }

    render() {
      const {fields} = this.state
      // https://github.com/Microsoft/TypeScript/issues/10727
      const {forwardedRef, ...props} = this.props as any
      const fieldsRef = (this.props as any).fieldsRef
      if (fieldsRef) {
        fieldsRef.current = fields
      }
      return (
        <ComposedComponent
          setDirtyField={this.setDirty}
          onChange={this.onChange}
          validateField={this.validate}
          fields={fields}
          ref={forwardedRef}
          {...props}
        />
      )
    }
  }

  return React.forwardRef((props: Subtract<P, WithFormProps>, ref?: Ref<any> | undefined) => (
    <FormProps {...props} forwardedRef={ref} />
  ))
}

export default withForm

import React, {Component, Ref} from 'react'
import {Subtract} from '../../types/generics'
import Legitity from '../../validation/Legitity'
import getDisplayName from '../getDisplayName'

export interface WithFormProps<K extends string | number | symbol> {
  setDirtyField: (K?: string) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  validateField(): {[name in K]: Legitity}

  validateField(name: K): Legitity
  fields: FieldState<K>
}

type FieldInputDict<K extends string | number | symbol> = Record<
  K,
  {
    getDefault(props: any): any
    validate(rawInput: any, props: any): Legitity
  }
>

interface Field {
  value: string
  error: string | undefined
  dirty: boolean
}

type FieldState<K extends string | number | symbol> = Record<K, Field>

// Serves as a lightweight alternative for a form library, best used for single-field forms
const withForm =
  <K extends string | number | symbol>(fields: FieldInputDict<K>) =>
  <P extends WithFormProps<K>>(ComposedComponent: React.ComponentType<P>) => {
    class FormProps extends Component<Subtract<P, WithFormProps<K>>> {
      static displayName = `WithForm(${getDisplayName(ComposedComponent)})`
      _mounted = false

      state = {
        fields: Object.keys(fields).reduce((obj, name) => {
          obj[name as K] = {
            value: fields[name as K].getDefault(this.props),
            error: undefined,
            dirty: false
          }
          return obj
        }, {} as FieldState<K>)
      }

      onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {fields} = this.state
        const {value} = e.target
        const name = e.target.name as K
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

      validate = (name?: K) => {
        if (!name) {
          return Object.keys(this.state.fields).reduce((obj, name) => {
            obj[name as K] = this.validate(name as K) as any
            return obj
          }, {} as FieldState<K>)
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
        const field = this.state.fields[name as K]
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

    return React.forwardRef((props: Subtract<P, WithFormProps<K>>, ref?: Ref<any> | undefined) => (
      <FormProps {...props} forwardedRef={ref} />
    ))
  }

export default withForm

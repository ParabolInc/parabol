import React, {Reducer, useCallback, useMemo, useReducer} from 'react'
import Legitity from '../validation/Legitity'
import useEventCallback from './useEventCallback'

interface FieldInputDict {
  [name: string]: {
    getDefault(): any
    validate?(rawInput: any): Legitity
    normalize?(rawInput: any, previousValue: any): any
  }
}

export interface UseFormField {
  value: string
  error: string | undefined
  dirty: boolean
  resetValue: (value?: string) => void
  setError: (error: string) => void
}

type FieldState<T> = {
  [P in keyof T]: UseFormField
}

interface SetError {
  type: 'setError'
  name: string
  error: string | undefined
}

interface SetDirty {
  type: 'setDirty'
  name: string
}

interface SetValue {
  type: 'setValue'
  name: string
  value: string
}

type FormAction = SetError | SetDirty | SetValue

const reducer = (state: FieldState<any>, action: FormAction) => {
  switch (action.type) {
    case 'setDirty':
      if (state[action.name]?.dirty) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          dirty: true
        }
      }
    case 'setError':
      if (state[action.name]?.error === action.error) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          error: action.error
        }
      }
    case 'setValue':
      if (state[action.name]?.value === action.value) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          value: action.value
        }
      }
  }
}

const useForm = <T extends FieldInputDict>(fieldInputDict: T, deps: any[] = []) => {
  const [state, dispatch] = useReducer<Reducer<FieldState<T>, FormAction>>(
    reducer,
    useMemo(
      () =>
        Object.keys(fieldInputDict).reduce((obj, name) => {
          obj[name as keyof T] = {
            value: fieldInputDict[name]?.getDefault(),
            error: undefined,
            dirty: false,
            resetValue: (value = '') => {
              dispatch({type: 'setValue', name, value})
            },
            setError: (error: string) => {
              dispatch({type: 'setError', name, error})
            }
          }
          return obj
        }, {} as FieldState<T>),
      [
        /* eslint-disable-line react-hooks/exhaustive-deps */
      ]
    )
  )

  const normalize = useCallback(
    (name: string, value: any) => {
      const normalizeField = fieldInputDict[name]?.normalize
      const prevValue = state[name]?.value
      return normalizeField ? normalizeField(value, prevValue) : value
    },
    [...deps, state]
  )

  const validate = useEventCallback((name: string, value: any) => {
    const validateField = fieldInputDict[name]?.validate
    if (!validateField) return {error: undefined, value}
    const res: Legitity = validateField(value)
    dispatch({type: 'setError', name, error: res.error})
    return res
  })

  function _validateField(name: string): Legitity
  function _validateField(name?: string): {[name: string]: Legitity}
  function _validateField(name?: string) {
    if (!name) {
      return Object.keys(state).reduce((obj, name) => {
        obj[name] = _validateField(name)
        return obj
      }, {})
    }
    return validate(name, state[name]?.value)
  }

  const validateField = useEventCallback(_validateField)

  const setDirty = useEventCallback((name?: string) => {
    if (!name) {
      Object.keys(state).forEach((name) => setDirty(name))
      return
    }
    dispatch({type: 'setDirty', name})
  })

  const setValue = useEventCallback((name: string, value: string) => {
    dispatch({type: 'setValue', name, value})
  })
  const onChange = useEventCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    const name = e.target.name
    const normalizedValue = normalize(name, value)
    setValue(name, normalizedValue)
    validate(name, normalizedValue)
  })

  return {setDirtyField: setDirty, setValue, onChange, validateField, fields: state}
}

export default useForm

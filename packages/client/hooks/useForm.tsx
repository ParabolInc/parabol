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

type FieldStateKey<T> = keyof T & string

type FieldState<T> = {
  [P in keyof T]: UseFormField
}

interface SetError<T extends string> {
  type: 'setError'
  name: T
  error: string | undefined
}

interface SetDirty<T extends string> {
  type: 'setDirty'
  name: T
}

interface SetValue<T extends string> {
  type: 'setValue'
  name: T
  value: string
}

type FormAction<T extends string> = SetError<T> | SetDirty<T> | SetValue<T>

const reducer = <T,>(state: FieldState<T>, action: FormAction<FieldStateKey<T>>) => {
  switch (action.type) {
    case 'setDirty':
      if (state[action.name].dirty) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          dirty: true
        }
      }
    case 'setError':
      if (state[action.name].error === action.error) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          error: action.error
        }
      }
    case 'setValue':
      if (state[action.name].value === action.value) return state
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
  const [state, dispatch] = useReducer<Reducer<FieldState<T>, FormAction<FieldStateKey<T>>>>(
    reducer,
    useMemo(
      () =>
        Object.keys(fieldInputDict).reduce((obj, name: FieldStateKey<T>) => {
          obj[name] = {
            value: fieldInputDict[name]!.getDefault(),
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
    (name: FieldStateKey<T>, value: any) => {
      const normalizeField = fieldInputDict[name]!.normalize
      const prevValue = state[name].value
      return normalizeField ? normalizeField(value, prevValue) : value
    },
    [...deps, state]
  )

  const validate = useEventCallback((name: string, value: any) => {
    const validateField = fieldInputDict[name]!.validate
    if (!validateField) return {error: undefined, value}
    const res: Legitity = validateField(value)
    dispatch({type: 'setError', name, error: res.error})
    return res
  })

  function _validateField(name: FieldStateKey<T>): Legitity
  function _validateField(name?: FieldStateKey<T>): FieldState<T>
  function _validateField(name?: FieldStateKey<T>) {
    if (!name) {
      return Object.keys(state).reduce((obj, name) => {
        obj[name as any] = _validateField(name)
        return obj
      }, {} as any)
    }
    return validate(name, state[name].value)
  }

  const validateField = useEventCallback(_validateField)

  const setDirty = useEventCallback((name?: FieldStateKey<T>) => {
    if (!name) {
      Object.keys(state).forEach((name) => setDirty(name))
      return
    }
    dispatch({type: 'setDirty', name})
  })

  const setValue = useEventCallback((name: FieldStateKey<T>, value: string) => {
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

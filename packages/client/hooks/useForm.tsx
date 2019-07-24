import React, {useCallback, useMemo, useReducer} from 'react'
import Legitity from '../validation/Legitity'

interface FieldInputDict {
  [name: string]: {
    getDefault (): any
    validate? (rawInput: any): Legitity
  }
}

interface Field {
  value: string
  error: string | undefined
  dirty: boolean
  resetValue: () => void
}

interface FieldState {
  [name: string]: Field
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

const reducer = (state: FieldState, action: FormAction) => {
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

const useForm = (fieldInputDict: FieldInputDict, deps: any[] = []) => {
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(
      () =>
        Object.keys(fieldInputDict).reduce(
          (obj, name) => {
            obj[name] = {
              value: fieldInputDict[name].getDefault(),
              error: undefined,
              dirty: false,
              resetValue: (value = '') => {
                dispatch({type: 'setValue', name, value})
              }
            }
            return obj
          },
          {} as FieldState
        ),
      []
    )
  )

  const validate = useCallback(
    (name?: string) => {
      if (!name) {
        return Object.keys(state).reduce((obj, name) => {
          obj[name] = validate(name)
          return obj
        }, {})
      }
      const validateField = fieldInputDict[name].validate
      if (!validateField) return
      const res: Legitity = validateField(state[name].value)
      dispatch({type: 'setError', name, error: res.error})
      return res
    },
    [...deps, state] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const setDirty = useCallback(
    (name?: string) => {
      if (!name) {
        Object.keys(state).forEach((name) => setDirty(name))
        return
      }
      dispatch({type: 'setDirty', name})
    },
    [...deps, state] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const {value} = e.target
      const name = e.target.name
      dispatch({type: 'setValue', name, value})
      validate(name)
    },
    [...deps] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return {setDirtyField: setDirty, onChange, validateField: validate, fields: state}
}

export default useForm

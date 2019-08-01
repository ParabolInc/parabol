import {useReducer} from 'react'

const useForceUpdate = () => {
  return useReducer((x) => x + 1, 0)[1] as () => void
}

export default useForceUpdate

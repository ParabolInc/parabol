import {useMemo} from 'react'
import {useHistory} from 'react-router'
import type {NavigateFn} from '../types/relayMutations'

/**
 * v5-compatible useNavigate hook that returns a NavigateFn.
 * In the v6 upgrade (PR 15), this file is deleted and all imports
 * switch to `import {useNavigate} from 'react-router'`.
 */
const useNavigate = (): NavigateFn => {
  const history = useHistory()
  return useMemo<NavigateFn>(
    () => (to, options) => {
      if (options?.replace) {
        history.replace(to as any, options?.state)
      } else {
        history.push(to as any, options?.state)
      }
    },
    [history]
  )
}

export default useNavigate

/*
 * Sometimes, we need the latest state, which means we need to keep it inside a container
 * but we also need to trigger rerenders, so we need to call useState or similar
 * calling useState is nice because it bails if called with the same input
 */
import {Dispatch, MutableRefObject, SetStateAction, useCallback, useRef, useState} from 'react'

const useRefState = <S>(
  initialState: S | (() => S)
): [MutableRefObject<S>, Dispatch<SetStateAction<S>>] => {
  const [firstState, _setState] = useState<S>(initialState)
  const latestState = useRef<S>(firstState)
  const setState = useCallback((nextState) => {
    latestState.current = nextState
    _setState(nextState)
  }, [])
  return [latestState, setState]
}

export default useRefState

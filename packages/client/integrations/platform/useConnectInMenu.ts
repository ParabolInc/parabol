import {useRef, useState} from 'react'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import getMutationError from '../../utils/relay/getMutationError'
import type {RegisteredClientIntegration} from './registry'

type ConnectingService = {service: RegisteredClientIntegration; title: string}

export type ConnectInMenuState =
  | {phase: 'idle'}
  | ({phase: 'waiting'} & ConnectingService)
  | ({phase: 'failed'; error: {message: string} | undefined} & ConnectingService)

export type BeginConnect = (
  service: RegisteredClientIntegration,
  title: string
) => MenuMutationProps

export const makeConnectAttemptProps = (
  mutationProps: MenuMutationProps,
  connecting: ConnectingService,
  isCurrent: () => boolean,
  setState: (state: ConnectInMenuState) => void
): MenuMutationProps => {
  const fail = (error: {message: string} | undefined) => {
    mutationProps.onCompleted()
    if (isCurrent()) setState({phase: 'failed', ...connecting, error})
  }
  return {
    ...mutationProps,
    onCompleted: (res, errors) => {
      const error = getMutationError(res, errors)
      if (error) {
        fail(error)
        return
      }
      mutationProps.onCompleted(res, errors)
      if (isCurrent()) setState({phase: 'idle'})
    },
    onError: fail
  }
}

const useConnectInMenu = (mutationProps: MenuMutationProps) => {
  const [state, setState] = useState<ConnectInMenuState>({phase: 'idle'})
  const attemptRef = useRef(0)
  const begin: BeginConnect = (service, title) => {
    const attempt = attemptRef.current + 1
    attemptRef.current = attempt
    setState({phase: 'waiting', service, title})
    return makeConnectAttemptProps(
      mutationProps,
      {service, title},
      () => attemptRef.current === attempt,
      setState
    )
  }
  const cancel = () => {
    attemptRef.current += 1
    setState({phase: 'idle'})
  }
  return {state, begin, cancel}
}

export default useConnectInMenu

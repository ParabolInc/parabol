import {useNavigate} from '@tanstack/react-router'
import {useTransition} from 'react'
import type {NavigateFn} from '../types/relayMutations'

// The page that navigates stays up, busy, until the router has loaded the next one
const useNavigateInTransition = () => {
  const navigate = useNavigate()
  const [isNavigating, startNavigating] = useTransition()
  const navigateInTransition: NavigateFn = (options) =>
    new Promise<void>((resolve) => {
      startNavigating(async () => {
        await navigate(options)
        resolve()
      })
    })
  return [navigateInTransition, isNavigating] as const
}

export default useNavigateInTransition

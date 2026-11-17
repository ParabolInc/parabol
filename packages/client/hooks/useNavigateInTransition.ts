import {useTransition} from 'react'
import {type NavigateFunction, type NavigateOptions, type To, useNavigate} from 'react-router'

// The page that navigates stays up until the next one can render, so it can show it is busy until then
const useNavigateInTransition = () => {
  const navigate = useNavigate()
  const [isNavigating, startNavigating] = useTransition()
  const navigateInTransition: NavigateFunction = (to: To | number, options?: NavigateOptions) => {
    startNavigating(() => {
      if (typeof to === 'number') navigate(to)
      else navigate(to, options)
    })
  }
  return [navigateInTransition, isNavigating] as const
}

export default useNavigateInTransition

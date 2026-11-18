import {
  type AnyRouter,
  type NavigateOptions,
  type RegisteredRouter,
  useNavigate
} from '@tanstack/react-router'
import {useLayoutEffect, useRef} from 'react'

// TanStack's <Navigate> navigates again on every render, and the page that renders it re-renders while the router
// loads the destination, so this one navigates once for each destination
function Redirect<
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = string,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = ''
>(props: NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>) {
  const navigate = useNavigate()
  const destination = JSON.stringify(props)
  const navigatedToRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (navigatedToRef.current === destination) return
    navigatedToRef.current = destination
    navigate(props)
  }, [destination])
  return null
}

export default Redirect

import type {HistoryLocation, RouterHistory} from '@tanstack/react-router'
import {createPath, type HistoryRouterProps, NavigationType, type To} from 'react-router'

type ReactRouterHistory = HistoryRouterProps['history']

const toHref = (to: To) => (typeof to === 'string' ? to : createPath(to))

const toNavigationType = (type: string) =>
  type === 'PUSH'
    ? NavigationType.Push
    : type === 'REPLACE'
      ? NavigationType.Replace
      : NavigationType.Pop

// react-router's state lives under one key of TanStack's history state, beside TanStack's own keys
export const readReactRouterState = (state: object) =>
  'reactRouterState' in state ? state.reactRouterState : null

const toReactRouterLocation = ({pathname, search, hash, state}: HistoryLocation) => ({
  pathname,
  search,
  hash,
  state: readReactRouterState(state),
  key: state.__TSR_key ?? 'default'
})

// Lets react-router hooks and links read & change the one history that TanStack Router owns
const createReactRouterHistory = (routerHistory: RouterHistory): ReactRouterHistory => {
  let action = NavigationType.Pop
  let sourceLocation = routerHistory.location
  let location = toReactRouterLocation(sourceLocation)
  const readLocation = () => {
    if (routerHistory.location !== sourceLocation) {
      sourceLocation = routerHistory.location
      location = toReactRouterLocation(sourceLocation)
    }
    return location
  }
  return {
    get action() {
      return action
    },
    get location() {
      return readLocation()
    },
    createHref: (to) => routerHistory.createHref(toHref(to)),
    createURL: (to) => new URL(toHref(to), window.location.href),
    encodeLocation: (to) => {
      const {pathname, search, hash} = new URL(toHref(to), window.location.href)
      return {pathname, search, hash}
    },
    push: (to, state) => routerHistory.push(toHref(to), {reactRouterState: state}),
    replace: (to, state) => routerHistory.replace(toHref(to), {reactRouterState: state}),
    go: (delta) => routerHistory.go(delta),
    listen: (listener) =>
      routerHistory.subscribe(({action: historyAction}) => {
        action = toNavigationType(historyAction.type)
        listener({action, location: readLocation(), delta: null})
      })
  }
}

export default createReactRouterHistory

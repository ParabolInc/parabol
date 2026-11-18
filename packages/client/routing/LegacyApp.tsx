import {useRouterState} from '@tanstack/react-router'
import {useMemo} from 'react'
import Action from '../components/Action/Action'
import {readReactRouterState} from './createReactRouterHistory'

// The legacy routes draw the location TanStack Router has committed, so they never render a page it is still loading
const LegacyApp = () => {
  const resolvedLocation = useRouterState({
    select: (state) => state.resolvedLocation ?? state.location
  })
  const location = useMemo(
    () => ({
      pathname: resolvedLocation.pathname,
      search: resolvedLocation.searchStr,
      hash: resolvedLocation.hash ? `#${resolvedLocation.hash}` : '',
      state: readReactRouterState(resolvedLocation.state),
      key: resolvedLocation.state.__TSR_key ?? 'default'
    }),
    [resolvedLocation]
  )
  return <Action location={location} />
}

export default LegacyApp

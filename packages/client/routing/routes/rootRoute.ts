import {createRootRouteWithContext} from '@tanstack/react-router'
import type Atmosphere from '../../Atmosphere'
import Action from '../../components/Action/Action'
import type {NavigateFn} from '../../types/relayMutations'
import type {QueryRefs} from '../queryRefs'

export const rootRoute = createRootRouteWithContext<{
  atmosphere: Atmosphere
  // for work a loader starts that navigates later, like a subscription
  navigate: NavigateFn
  queryRefs: QueryRefs
}>()({
  component: Action
})

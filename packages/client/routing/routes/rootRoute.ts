import {createRootRouteWithContext} from '@tanstack/react-router'
import type Atmosphere from '../../Atmosphere'
import Action from '../../components/Action/Action'
import type {QueryRefs} from '../queryRefs'

export const rootRoute = createRootRouteWithContext<{
  atmosphere: Atmosphere
  queryRefs: QueryRefs
}>()({
  component: Action
})

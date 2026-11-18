import {createRootRouteWithContext} from '@tanstack/react-router'
import type Atmosphere from '../../Atmosphere'
import Action from '../../components/Action/Action'

export const rootRoute = createRootRouteWithContext<{atmosphere: Atmosphere}>()({
  component: Action
})

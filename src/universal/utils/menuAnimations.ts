import {css} from 'emotion'
import {Duration} from '../types/constEnums'
import {PortalState} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'

export default {
  [PortalState.Entered]: css({
    opacity: 1,
    transform: 'scale(1)',
    transition: `all ${Duration.MENU_OPEN}ms ${DECELERATE}`
  }),
  [PortalState.Exiting]: css({
    opacity: 0,
    transform: `translate3d(0, ${-16}px, 0)`,
    transition: `all 80ms ease-in`
  }),
  [PortalState.Entering]: css({
    opacity: 0,
    transform: `scale(0)`
  }),
  [PortalState.Exited]: ''
}

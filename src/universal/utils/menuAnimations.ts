import {css} from 'emotion'
import {PortalState} from 'universal/hooks/usePortal'

export default {
  [PortalState.Entered]: css({
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: `all 100ms ease-in`
  }),
  [PortalState.Exiting]: css({
    opacity: 0,
    transform: `translate3d(0, ${-16}px, 0)`,
    transition: `all 80ms ease-in`
  }),
  [PortalState.Entering]: css({
    opacity: 0,
    transform: `translate3d(0, ${-8}px, 0)`
  }),
  [PortalState.Exited]: ''
}

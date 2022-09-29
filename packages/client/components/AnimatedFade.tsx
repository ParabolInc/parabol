/* Deprecated. See internals of useMenuPortal */

import {ClassNames} from '@emotion/core'
import React, {Component, ReactNode} from 'react'
import {CSSTransition} from 'react-transition-group'

interface Props extends CSSTransition {
  appear?: boolean
  in?: boolean
  onExited?: () => void
  exit?: boolean
  unmountOnExit?: boolean
  children: ReactNode
  duration?: number
  slide?: number
}

// eslint-disable-next-line
class AnimatedFade extends Component<Props> {
  render() {
    const {children, duration = 100, slide = 32, ...props} = this.props

    const classNames = (css) => {
      const enter = css({
        opacity: 0,
        transform: `translate3d(0, ${slide}px, 0)`
      })
      const enterActive = css({
        opacity: '1 !important' as any,
        transform: 'translate3d(0, 0, 0) !important',
        transition: `all ${duration}ms ease-in !important`
      })

      const exit = css({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)'
      })

      const exitActive = css({
        opacity: '0 !important' as any,
        transform: `translate3d(0, ${-slide}px, 0) !important`,
        transition: `all ${duration}ms ease-in !important`
      })
      return {
        appear: enter,
        appearActive: enterActive,
        enter,
        enterActive,
        exit,
        exitActive
      }
    }
    return (
      <ClassNames>
        {({css}) => {
          return (
            <CSSTransition
              {...props}
              classNames={classNames(css)}
              timeout={{
                enter: duration,
                exit: duration
              }}
            >
              {children}
            </CSSTransition>
          )
        }}
      </ClassNames>
    )
  }
}

export default AnimatedFade

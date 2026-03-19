import {type ComponentType, type ReactNode, useEffect, useRef, useState} from 'react'
import DelayUnmountShrinkAndScale from './DelayUnmountShrinkAndScale'

enum TransitionState {
  Entered,
  Exiting,
  Exited
}

interface PassthroughProps {
  isExiting: boolean
  duration: number
}

interface Props {
  children: ReactNode
  Animator?: ComponentType<PassthroughProps>
  unmountAfter: number
}

const DelayUnmount = (props: Props) => {
  const {Animator = DelayUnmountShrinkAndScale, children, unmountAfter} = props
  const [transitionState, setTransitionState] = useState(
    children !== null ? TransitionState.Entered : TransitionState.Exited
  )
  const exitingChildrenRef = useRef(children)
  const exitTimerRef = useRef<number | undefined>(undefined)

  // Synchronous state derivation (replaces getDerivedStateFromProps)
  if (children !== null) {
    exitingChildrenRef.current = children
    if (transitionState !== TransitionState.Entered) {
      setTransitionState(TransitionState.Entered)
    }
  } else if (transitionState === TransitionState.Entered) {
    setTransitionState(TransitionState.Exiting)
  }

  // Start exit timer when entering Exiting state
  useEffect(() => {
    if (transitionState === TransitionState.Exiting) {
      exitTimerRef.current = window.setTimeout(() => {
        exitTimerRef.current = undefined
        setTransitionState(TransitionState.Exited)
      }, unmountAfter)
      return () => {
        if (exitTimerRef.current !== undefined) {
          clearTimeout(exitTimerRef.current)
          exitTimerRef.current = undefined
        }
      }
    }
    return undefined
  }, [transitionState, unmountAfter])

  if (transitionState === TransitionState.Exited) return null
  const isExiting = transitionState === TransitionState.Exiting
  return (
    <Animator isExiting={isExiting} duration={unmountAfter}>
      {isExiting ? exitingChildrenRef.current : children}
    </Animator>
  )
}

export default DelayUnmount

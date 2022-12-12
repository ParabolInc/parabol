import {useMemo, useRef} from 'react'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'
import useEventCallback from './useEventCallback'
import useForceUpdate from './useForceUpdate'

export enum TransitionStatus {
  MOUNTED,
  ENTERING,
  ENTERED,
  EXITING
}

type Key = string | symbol

interface TransitionChild<T = {key: Key}> {
  child: T
  status: TransitionStatus
  onTransitionEnd: () => void
}

const useTransition = <T extends {key: Key}>(children: T[]) => {
  const previousTransitionChildrenRef = useRef<TransitionChild<T>[]>([])
  const forceUpdate = useForceUpdate()

  const transitionEndFactory = useEventCallback((key: Key) => (e?: React.TransitionEvent) => {
    // animations must live in the outermost element if triggered on onTransitionEnd
    if (e && e.target !== e.currentTarget) return
    const idx = previousTransitionChildrenRef.current.findIndex(
      (tChild) => tChild.child.key === key
    )
    if (idx === -1) return
    const tChild = previousTransitionChildrenRef.current[idx]!
    const {status} = tChild
    const {current: nextChildren} = previousTransitionChildrenRef
    if (status === TransitionStatus.ENTERING) {
      previousTransitionChildrenRef.current = [
        ...nextChildren.slice(0, idx),
        {...tChild, status: TransitionStatus.ENTERED},
        ...nextChildren.slice(idx + 1)
      ]
      forceUpdate()
    } else if (status === TransitionStatus.EXITING) {
      previousTransitionChildrenRef.current = [
        ...nextChildren.slice(0, idx),
        ...nextChildren.slice(idx + 1)
      ]
      forceUpdate()
    }
  })

  const beginTransition = useEventCallback((keys: Key[]) => {
    // double required to ensure entering animations get called
    requestDoubleAnimationFrame(() => {
      let doUpdate = false
      keys.forEach((key) => {
        const nextChildren = previousTransitionChildrenRef.current
        const tChildIdx = nextChildren.findIndex(({child}) => child.key === key)
        if (tChildIdx !== -1) {
          const tChild = {...nextChildren[tChildIdx]!, status: TransitionStatus.ENTERING}
          previousTransitionChildrenRef.current = [
            ...nextChildren.slice(0, tChildIdx),
            tChild,
            ...nextChildren.slice(tChildIdx + 1)
          ]
          doUpdate = true
        }
      })
      if (doUpdate) {
        forceUpdate()
      }
    })
  })

  return useMemo(() => {
    const currentTChildren = [] as TransitionChild<T>[]
    const {current: prevTChildrenTemp} = previousTransitionChildrenRef
    const prevTChildren = prevTChildrenTemp.filter(
      (prevTChild) => prevTChild.status !== TransitionStatus.EXITING
    )

    let touched = false
    // add mounted nodes + update new orderings
    const updatedKeys = [] as Key[]
    children.forEach((nextChild, idxInNext) => {
      const idxInPrev = prevTChildren.findIndex(({child}) => child.key === nextChild.key)
      const status = idxInPrev === -1 ? TransitionStatus.MOUNTED : prevTChildren[idxInPrev]!.status
      currentTChildren.push({
        status,
        child: nextChild,
        onTransitionEnd: transitionEndFactory(nextChild.key)
      })
      if (idxInPrev === -1 || idxInPrev !== idxInNext) {
        touched = true
        updatedKeys.push(nextChild.key)
        // beginTransition(nextChild.key)
      }
    })
    if (touched) {
      beginTransition(updatedKeys)
    }

    // add exiting nodes
    prevTChildren.forEach((prevTChild, i) => {
      const {child} = prevTChild
      const {key} = child
      const idxInNext = children.findIndex((child) => child.key === key)
      if (idxInNext === -1) {
        touched = true
        const exitingTChild = {...prevTChild, status: TransitionStatus.EXITING}
        currentTChildren.splice(i, 0, exitingTChild)
      }
    })
    if (touched) {
      // keep deep equal things the same to reduce render count
      previousTransitionChildrenRef.current = currentTChildren
    }
    return previousTransitionChildrenRef.current
  }, [
    beginTransition,
    children,
    previousTransitionChildrenRef.current /* eslint-disable-line react-hooks/exhaustive-deps */
  ])
}

export default useTransition

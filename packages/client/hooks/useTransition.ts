import {useMemo, useRef} from 'react'
import useForceUpdate from './useForceUpdate'
import useEventCallback from './useEventCallback'

// const getValidChildren = (children: ReactNode) => {
//   const validChildren = [] as ReactElement<any>[]
//   Children.forEach(children, (child) => {
//     if (isValidElement(child)) {
//       validChildren.push(child)
//     }
//   })
//   return validChildren
// }

export enum TransitionStatus {
  MOUNTED,
  ENTERING,
  ENTERED,
  EXITING
}

interface TransitionChild<T = {key: string}> {
  child: T
  status: TransitionStatus
  onTransitionEnd: () => void
}

const useTransition = <T extends {key: string}>(children: T[]) => {
  const previousTransitionChildrenRef = useRef<TransitionChild<T>[]>([])
  const forceUpdate = useForceUpdate()

  const transitionEndFactory = useEventCallback((key: string) => () => {
    const idx = previousTransitionChildrenRef.current.findIndex(
      (tChild) => tChild.child.key === key
    )
    if (idx === -1) return
    const tChild = previousTransitionChildrenRef.current[idx]
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

  const beginTransition = useEventCallback((key: string) => {
    requestAnimationFrame(() => {
      const tChildIdx = previousTransitionChildrenRef.current.findIndex(
        ({child}) => child.key === key
      )
      if (tChildIdx !== -1) {
        const nextChildren = previousTransitionChildrenRef.current
        const tChild = {...nextChildren[tChildIdx], status: TransitionStatus.ENTERING}
        previousTransitionChildrenRef.current = [
          ...nextChildren.slice(0, tChildIdx),
          tChild,
          ...nextChildren.slice(tChildIdx + 1)
        ]
        forceUpdate()
      }
    })
  })

  return useMemo(() => {
    const currentTChildren = [] as TransitionChild<T>[]
    const {current: prevTChildren} = previousTransitionChildrenRef

    let touched = false
    // add mounted nodes
    for (let i = 0; i < children.length; i++) {
      const nextChild = children[i]
      const idxInPrev = prevTChildren.findIndex(({child}) => child.key === nextChild.key)
      const status = idxInPrev === -1 ? TransitionStatus.MOUNTED : prevTChildren[idxInPrev].status
      currentTChildren.push({
        status,
        child: nextChild,
        onTransitionEnd: transitionEndFactory(nextChild.key)
      })
      if (idxInPrev === -1) {
        touched = true
        beginTransition(nextChild.key)
      }
    }

    // add exiting nodes
    for (let i = 0; i < prevTChildren.length; i++) {
      const prevTChild = prevTChildren[i]
      const {child} = prevTChild
      const {key} = child
      const idxInNext = children.findIndex((child) => child.key === key)
      if (idxInNext === -1) {
        touched = true
        const exitingTChild = {...prevTChild, status: TransitionStatus.EXITING}
        currentTChildren.splice(i, 0, exitingTChild)
      }
    }
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

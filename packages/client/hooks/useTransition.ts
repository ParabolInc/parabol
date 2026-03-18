import {useEffect, useRef, useState} from 'react'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'
import useEventCallback from './useEventCallback'

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
  // Use useState instead of useRef for transition children.
  // React properly handles useState in StrictMode — both render invocations
  // see the same committed state, preventing the double-invocation corruption
  // that occurred when useMemo mutated refs.
  const [animatedItems, setAnimatedItems] = useState<TransitionChild<T>[]>([])
  const pendingKeysRef = useRef<Key[]>([])

  // Always keep latest child data in a ref so we can merge fresh references
  // into the return value without triggering extra re-renders
  const latestChildByKeyRef = useRef(new Map<Key, T>())
  latestChildByKeyRef.current = new Map(children.map((c) => [c.key, c]))

  const transitionEndFactory = useEventCallback((key: Key) => (e?: React.TransitionEvent) => {
    // animations must live in the outermost element if triggered on onTransitionEnd
    if (e && e.target !== e.currentTarget) return
    setAnimatedItems((prev) => {
      const idx = prev.findIndex((tChild) => tChild.child.key === key)
      if (idx === -1) return prev
      const tChild = prev[idx]!
      const {status} = tChild
      if (status === TransitionStatus.ENTERING) {
        return [
          ...prev.slice(0, idx),
          {...tChild, status: TransitionStatus.ENTERED},
          ...prev.slice(idx + 1)
        ]
      } else if (status === TransitionStatus.EXITING) {
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
      }
      return prev
    })
  })

  const beginTransition = useEventCallback((keys: Key[]) => {
    // double required to ensure entering animations get called
    requestDoubleAnimationFrame(() => {
      setAnimatedItems((prev) => {
        let doUpdate = false
        const next = prev.map((tChild) => {
          if (keys.includes(tChild.child.key) && tChild.status === TransitionStatus.MOUNTED) {
            doUpdate = true
            return {...tChild, status: TransitionStatus.ENTERING}
          }
          return tChild
        })
        return doUpdate ? next : prev
      })
    })
  })

  // Detect children changes using key comparison.
  // Uses "set state during render" — React's recommended pattern for deriving
  // state from props. React restarts the render with the updated state before
  // painting, so there's no visual flicker. Crucially, useState returns the
  // committed state in both StrictMode invocations, preventing the
  // double-invocation corruption that occurred with ref mutation in useMemo.
  const [prevKeys, setPrevKeys] = useState<Key[]>([])
  const currentKeys = children.map((c) => c.key)
  const keysChanged =
    currentKeys.length !== prevKeys.length || currentKeys.some((k, i) => k !== prevKeys[i])

  if (keysChanged) {
    setPrevKeys(currentKeys)
    const filteredPrevTChildren = animatedItems.filter(
      (prevTChild) => prevTChild.status !== TransitionStatus.EXITING
    )

    const currentTChildren = [] as TransitionChild<T>[]
    const updatedKeys = [] as Key[]
    let touched = false

    // add mounted nodes + update new orderings
    children.forEach((nextChild, idxInNext) => {
      const idxInPrev = filteredPrevTChildren.findIndex(({child}) => child.key === nextChild.key)
      const status =
        idxInPrev === -1 ? TransitionStatus.MOUNTED : filteredPrevTChildren[idxInPrev]!.status
      currentTChildren.push({
        status,
        child: nextChild,
        onTransitionEnd: transitionEndFactory(nextChild.key)
      })
      if (idxInPrev === -1 || idxInPrev !== idxInNext) {
        touched = true
        updatedKeys.push(nextChild.key)
      }
    })

    // add exiting nodes
    filteredPrevTChildren.forEach((prevTChild, i) => {
      const {child} = prevTChild
      const {key} = child
      const idxInNext = children.findIndex((child) => child.key === key)
      if (idxInNext === -1) {
        touched = true
        currentTChildren.splice(i, 0, {
          ...prevTChild,
          status: TransitionStatus.EXITING
        })
      }
    })

    setAnimatedItems(currentTChildren)
    pendingKeysRef.current = touched ? updatedKeys : []
  }

  // Defer the beginTransition side effect to after mount/commit
  useEffect(() => {
    const keys = pendingKeysRef.current
    if (keys.length > 0) {
      pendingKeysRef.current = []
      beginTransition(keys)
    }
  })

  // Merge latest child data into transition children.
  // This keeps child references fresh (e.g., updated props) without
  // triggering extra re-renders via setState.
  return animatedItems.map((tc) => {
    if (tc.status === TransitionStatus.EXITING) return tc
    const latest = latestChildByKeyRef.current.get(tc.child.key)
    return latest && latest !== tc.child ? {...tc, child: latest} : tc
  })
}

export default useTransition

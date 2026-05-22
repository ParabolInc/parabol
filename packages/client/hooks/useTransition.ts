import {useLayoutEffect, useRef, useState} from 'react'
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
  const [animatedItems, setAnimatedItems] = useState<TransitionChild<T>[]>([])
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
    // double rAF: ensures the browser commits the MOUNTED styles before transitioning to ENTERING
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

  // useLayoutEffect (not set-state-during-render): StrictMode's verification render
  // reverts mid-render setState, which can roll EXITING back to ENTERED and trap items visible.
  const currentKeys = children.map((c) => c.key)
  const currentKeysRef = useRef<Key[]>(currentKeys)
  currentKeysRef.current = currentKeys

  useLayoutEffect(() => {
    setAnimatedItems((prev) => {
      const keys = currentKeysRef.current
      const filteredPrev = prev.filter((tChild) => tChild.status !== TransitionStatus.EXITING)
      const prevKeys = filteredPrev.map((tChild) => tChild.child.key)
      const keysSame =
        keys.length === prevKeys.length && keys.every((k, i) => k === prevKeys[i])
      if (keysSame) return prev

      const next: TransitionChild<T>[] = []
      const newlyAdded: Key[] = []
      keys.forEach((key) => {
        const child = latestChildByKeyRef.current.get(key)!
        const existing = filteredPrev.find((tChild) => tChild.child.key === key)
        if (existing) {
          next.push(existing)
        } else {
          next.push({
            child,
            status: TransitionStatus.MOUNTED,
            onTransitionEnd: transitionEndFactory(key)
          })
          newlyAdded.push(key)
        }
      })

      filteredPrev.forEach((tChild, i) => {
        if (!keys.includes(tChild.child.key)) {
          next.splice(i, 0, {...tChild, status: TransitionStatus.EXITING})
        }
      })

      if (newlyAdded.length > 0) {
        beginTransition(newlyAdded)
      }
      return next
    })
  }, [children])

  return animatedItems.map((tc) => {
    if (tc.status === TransitionStatus.EXITING) return tc
    const latest = latestChildByKeyRef.current.get(tc.child.key)
    return latest && latest !== tc.child ? {...tc, child: latest} : tc
  })
}

export default useTransition

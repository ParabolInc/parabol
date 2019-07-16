import React, {useCallback, useEffect, useLayoutEffect, useRef} from 'react'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {Snack} from 'universal/Atmosphere'
import useRefState from 'universal/hooks/useRefState'
import usePortal from 'universal/hooks/usePortal'
import useTransition from 'universal/hooks/useTransition'
import shortid from 'shortid'
import styled from 'react-emotion'
import SnackbarMessage from './SnackbarMessage'

const MAX_SNACKS = 1

interface KeyedSnack extends Snack {
  key: string
}

const Modal = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-end',
  left: 0,
  paddingBottom: 16,
  position: 'absolute',
  top: 0,
  width: '100%',
  pointerEvents: 'none'
})

const Snackbar = () => {
  const snackQueueRef = useRef<KeyedSnack[]>([])
  const [snacksRef, setActiveSnacks] = useRefState<KeyedSnack[]>([])
  const atmosphere = useAtmosphere()
  const {openPortal, terminatePortal, portal} = usePortal({id: 'snackbar'})
  const transitionChildren = useTransition(snacksRef.current)
  const transitionChildrenRef = useRef(transitionChildren)
  transitionChildrenRef.current = transitionChildren
  console.log('transitionChildren', transitionChildren[0])
  const filterSnacks = useCallback((filterFn: (snack: KeyedSnack) => boolean) => {
    snackQueueRef.current = snackQueueRef.current.filter(filterFn)
    const nextSnacks = snacksRef.current.filter(filterFn)
    setActiveSnacks(nextSnacks)
  }, [])

  const dismissSnack = useCallback((snackToDismiss: KeyedSnack) => {
    filterSnacks((snack: KeyedSnack) => snack !== snackToDismiss)
  }, [])

  const showSnack = useCallback((snack: KeyedSnack) => {
    setActiveSnacks([...snacksRef.current, snack])
    if (snack.autoDismiss) {
      setTimeout(() => {
        dismissSnack(snack)
      }, snack.autoDismiss * 1000)
    }
  }, [])

  useEffect(() => {
    atmosphere.eventEmitter.on('addToast', (snack) => {
      const keyedSnack = {key: shortid.generate(), ...snack}
      if (transitionChildrenRef.current.length < MAX_SNACKS) {
        showSnack(keyedSnack)
      } else {
        snackQueueRef.current.push(keyedSnack)
      }
    })
  }, [])

  useLayoutEffect(() => {
    if (transitionChildren.length === 0 && snackQueueRef.current.length === 0) {
      terminatePortal()
    } else {
      openPortal()
    }
    if (snackQueueRef.current.length > 0 && transitionChildren.length < MAX_SNACKS) {
      setTimeout(() => showSnack(snackQueueRef.current.shift()!))
    }
  }, [transitionChildren])

  return portal(
    <Modal>
      {transitionChildren.map(({child, onTransitionEnd, status}) => {
        return (
          <SnackbarMessage
            key={child.key}
            message={child.message}
            status={status}
            onTransitionEnd={onTransitionEnd}
            dismissSnack={() => dismissSnack(child)}
          />
        )
      })}
    </Modal>
  )
}

export default Snackbar

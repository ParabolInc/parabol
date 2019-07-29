import React, {useEffect, useLayoutEffect, useRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useRefState from '../hooks/useRefState'
import usePortal from '../hooks/usePortal'
import useTransition from '../hooks/useTransition'
import shortid from 'shortid'
import styled from '@emotion/styled'
import SnackbarMessage from './SnackbarMessage'
import graphql from 'babel-plugin-relay/macro'
import useLocalQuery from '../hooks/useLocalQuery'
import {SnackbarQuery} from '../__generated__/SnackbarQuery.graphql'
import useEventCallback from '../hooks/useEventCallback'

const MAX_SNACKS = 1

const query = graphql`
  query SnackbarQuery {
    viewer {
      topOfFAB
    }
  }
`

const Modal = styled('div')<{topOfFAB: number | undefined | null}>(({topOfFAB}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-end',
  left: 0,
  padding: 8,
  paddingBottom: topOfFAB || 8,
  position: 'absolute',
  top: 0,
  width: '100%',
  pointerEvents: 'none',
  zIndex: 1 // hack to hide task cards since draft-editor has a z-index of 1, it'll shine through if this isn't present
}))

export type SnackbarRemoveFn = (snack: Snack) => boolean

export interface SnackAction {
  label: string
  callback: () => void
}

export interface Snack {
  key: string // string following format: `type` OR `type:variable`
  message: string
  autoDismiss: number // seconds. 0 means never dismiss
  action?: SnackAction
  secondaryAction?: SnackAction
}

const Snackbar = React.memo(() => {
  const snackQueueRef = useRef<Snack[]>([])
  const [snacksRef, setActiveSnacks] = useRefState<Snack[]>([])
  const atmosphere = useAtmosphere()
  const {openPortal, terminatePortal, portal} = usePortal({id: 'snackbar'})
  const transitionChildren = useTransition(snacksRef.current)
  const transitionChildrenRef = useRef(transitionChildren)
  const data = useLocalQuery<SnackbarQuery>(query)
  const topOfFAB = data && data.viewer && data.viewer.topOfFAB
  // used to ensure the snack isn't dismissed when the cursor is on it
  const [hoveredSnackRef, setHoveredSnack] = useRefState<Snack | null>(null)
  const dismissOnLeaveRef = useRef<Snack>()

  transitionChildrenRef.current = transitionChildren

  const filterSnacks = useEventCallback((removeFn: SnackbarRemoveFn) => {
    const filterFn = (snack: Snack) => !removeFn(snack)
    snackQueueRef.current = snackQueueRef.current.filter(filterFn)
    const nextSnacks = snacksRef.current.filter(filterFn)
    if (nextSnacks.length !== snacksRef.current.length) {
      setActiveSnacks(nextSnacks)
    }
  })

  const dismissSnack = useEventCallback((snackToDismiss: Snack) => {
    filterSnacks((snack: Snack) => snack === snackToDismiss)
  })

  const showSnack = useEventCallback((snack: Snack) => {
    setActiveSnacks([...snacksRef.current, snack])
    if (snack.autoDismiss !== 0) {
      setTimeout(() => {
        if (hoveredSnackRef.current === snack) {
          dismissOnLeaveRef.current = snack
        } else {
          dismissSnack(snack)
        }
      }, snack.autoDismiss * 1000)
    }
  })

  const onMouseEnter = (snack: Snack) => () => {
    setHoveredSnack(snack)
  }

  const onMouseLeave = () => {
    if (dismissOnLeaveRef.current) {
      dismissSnack(dismissOnLeaveRef.current)
      dismissOnLeaveRef.current = undefined
    }
    setHoveredSnack(null)
  }

  // handle events
  useEffect(() => {
    const handleAdd = (snack) => {
      const dupeFilter = ({key}: Snack) => key === snack.key
      const snackInQueue = snackQueueRef.current.find(dupeFilter)
      const snackIsActive = snacksRef.current.find(dupeFilter)
      if (snackInQueue || snackIsActive) return
      const keyedSnack = {key: shortid.generate(), ...snack}
      if (transitionChildrenRef.current.length < MAX_SNACKS) {
        showSnack(keyedSnack)
      } else {
        snackQueueRef.current.push(keyedSnack)
      }
    }
    atmosphere.eventEmitter.on('addSnackbar', handleAdd)
    atmosphere.eventEmitter.on('removeSnackbar', filterSnacks)
    return () => {
      atmosphere.eventEmitter.off('addSnackbar', handleAdd)
      atmosphere.eventEmitter.off('removeSnackbar', filterSnacks)
    }
  }, [atmosphere.eventEmitter, filterSnacks, showSnack, snacksRef])

  // handle portal
  useLayoutEffect(() => {
    if (transitionChildren.length === 0 && snackQueueRef.current.length === 0) {
      terminatePortal()
    } else {
      openPortal()
    }
  }, [openPortal, terminatePortal, transitionChildren])

  // handle queue
  useEffect(() => {
    if (snackQueueRef.current.length > 0 && transitionChildren.length < MAX_SNACKS) {
      showSnack(snackQueueRef.current.shift()!)
    }
  }, [showSnack, transitionChildren])

  return portal(
    <Modal topOfFAB={topOfFAB}>
      {transitionChildren.map(({child, onTransitionEnd, status}) => {
        return (
          <SnackbarMessage
            key={child.key}
            message={child.message}
            action={child.action}
            secondaryAction={child.secondaryAction}
            status={status}
            onTransitionEnd={onTransitionEnd}
            dismissSnack={() => dismissSnack(child)}
            onMouseEnter={onMouseEnter(child)}
            onMouseLeave={onMouseLeave}
          />
        )
      })}
    </Modal>
  )
})

export default Snackbar

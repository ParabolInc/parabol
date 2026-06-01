import * as Toast from '@radix-ui/react-toast'
import {AnimatePresence, motion} from 'motion/react'
import {memo, useEffect, useRef, useState} from 'react'
import {useLocation} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useEventCallback from '../hooks/useEventCallback'
import {Breakpoint, NavSidebar, ZIndex} from '../types/constEnums'
import clientTempId from '../utils/relay/clientTempId'
import SnackbarMessage from './SnackbarMessage'

const MAX_SNACKS = 1

export type SnackbarRemoveFn = (snack: Snack) => boolean

export interface SnackAction {
  label: string
  callback: () => void
}

export interface Snack {
  key: string // string following format: `type` OR `type:variable`
  message: string
  autoDismiss: number // seconds. 0 means never dismiss
  noDismissOnClick?: boolean // clicking has no effect on the show state
  onDismiss?: () => void
  onManualDismiss?: () => void
  onShow?: () => void
  action?: SnackAction
  secondaryAction?: SnackAction
  showDismissButton?: boolean
}

const Snackbar = memo(() => {
  const snackQueueRef = useRef<Snack[]>([])
  const [activeSnacks, setActiveSnacks] = useState<Snack[]>([])
  const activeSnackKeysRef = useRef(new Set<string>())
  const atmosphere = useAtmosphere()
  const location = useLocation()
  const hasSidebar =
    location.pathname.startsWith('/meet/') || !!location.pathname.match(/\/meet\/.*\/responses/g)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const hoveredSnackRef = useRef<Snack | null>(null)
  const dismissOnLeaveRef = useRef<Snack>()

  const filterSnacks = useEventCallback((removeFn: SnackbarRemoveFn) => {
    const filterFn = (snack: Snack) => !removeFn(snack)
    snackQueueRef.current = snackQueueRef.current.filter(filterFn)
    setActiveSnacks((prev) => {
      const next = prev.filter(filterFn)
      if (next.length !== prev.length) {
        activeSnackKeysRef.current = new Set(next.map((s) => s.key))
        return next
      }
      return prev
    })
  })

  const dismissSnack = useEventCallback((snackToDismiss: Snack) => {
    snackToDismiss.onDismiss?.()
    filterSnacks((snack: Snack) => snack === snackToDismiss)
  })

  const showSnack = useEventCallback((snack: Snack) => {
    activeSnackKeysRef.current.add(snack.key)
    setActiveSnacks((prev) => [...prev, snack])
    if (snack.autoDismiss !== 0) {
      setTimeout(() => {
        if (hoveredSnackRef.current === snack) {
          dismissOnLeaveRef.current = snack
        } else {
          dismissSnack(snack)
        }
      }, snack.autoDismiss * 1000)
    }
    snack.onShow?.()
  })

  const onMouseEnter = (snack: Snack) => () => {
    hoveredSnackRef.current = snack
  }

  const onMouseLeave = () => {
    if (dismissOnLeaveRef.current) {
      dismissSnack(dismissOnLeaveRef.current)
      dismissOnLeaveRef.current = undefined
    }
    hoveredSnackRef.current = null
  }

  const handleAdd = useEventCallback((snack) => {
    const snackInQueue = snackQueueRef.current.find(({key}) => key === snack.key)
    const snackIsActive = activeSnackKeysRef.current.has(snack.key)
    if (snackInQueue || snackIsActive) return
    if (typeof snack.message !== 'string') {
      console.error(`Bad snack message: ${snack.key}`)
      if (snack.message.message) {
        snack.message = snack.message.message
      } else {
        return
      }
    }
    const keyedSnack = {key: clientTempId(), ...snack}
    if (activeSnacks.length < MAX_SNACKS) {
      showSnack(keyedSnack)
    } else {
      snackQueueRef.current.push(keyedSnack)
    }
  })

  useEffect(() => {
    atmosphere.eventEmitter.on('addSnackbar', handleAdd)
    atmosphere.eventEmitter.on('removeSnackbar', filterSnacks)
    return () => {
      atmosphere.eventEmitter.off('addSnackbar', handleAdd)
      atmosphere.eventEmitter.off('removeSnackbar', filterSnacks)
    }
  }, [])

  useEffect(() => {
    if (snackQueueRef.current.length > 0 && activeSnacks.length < MAX_SNACKS) {
      showSnack(snackQueueRef.current.shift()!)
    }
  }, [showSnack, activeSnacks])

  return (
    <Toast.Provider>
      <AnimatePresence>
        {activeSnacks.map((snack) => {
          const dismiss = () => {
            if (snack.noDismissOnClick) return
            dismissSnack(snack)
            snack.onManualDismiss?.()
          }
          return (
            <Toast.Root
              key={snack.key}
              asChild
              open
              duration={Infinity}
              onOpenChange={(open) => {
                if (!open) dismissSnack(snack)
              }}
            >
              <motion.li
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20, transition: {duration: 0.15, ease: 'easeOut'}}}
                transition={{duration: 0.25, ease: 'easeIn'}}
                onMouseEnter={onMouseEnter(snack)}
                onMouseLeave={onMouseLeave}
                style={{listStyle: 'none'}}
              >
                <SnackbarMessage
                  message={snack.message}
                  action={snack.action}
                  secondaryAction={snack.secondaryAction}
                  dismissSnack={dismiss}
                  showDismissButton={snack.showDismissButton}
                />
              </motion.li>
            </Toast.Root>
          )
        })}
      </AnimatePresence>
      <Toast.Viewport
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          height: '100vh',
          width: hasSidebar && isDesktop ? `calc(100% + ${NavSidebar.WIDTH}px)` : '100%',
          padding: 8,
          paddingBottom: hasSidebar ? 64 : 8,
          pointerEvents: 'none',
          zIndex: ZIndex.SNACKBAR,
          listStyle: 'none',
          margin: 0,
          outline: 'none'
        }}
      />
    </Toast.Provider>
  )
})

export default Snackbar

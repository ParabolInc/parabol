import ms from 'ms'
import {useEffect} from 'react'
import {RouterProps, useHistory} from 'react-router'
import Atmosphere from '../Atmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import useAtmosphere from './useAtmosphere'

const NAG_EVERY = ms('3m')

const getIsNaggingPath = (history: RouterProps['history']) => {
  const {location} = history
  const {pathname} = location
  return !(pathname.includes('/usage') || pathname.includes('/meet/'))
}

const emitNag = (atmosphere: Atmosphere, history: RouterProps['history']) => {
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'usage',
    message: 'View your usage stats',
    autoDismiss: 0,
    onDismiss: () => {
      setTimeout(() => {
        const isNaggingPath = getIsNaggingPath(history)
        if (!isNaggingPath) return
        emitNag(atmosphere, history)
      }, NAG_EVERY)
    },
    action: {
      label: 'View Usage',
      callback: () => {
        atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'usage')
        history.push(`/usage`)
        SendClientSegmentEventMutation(atmosphere, 'Clicked usage snackbar CTA')
      }
    }
  })
  SendClientSegmentEventMutation(atmosphere, 'Sent usage snackbar')
}

const useUsageSnackNag = (insights: boolean) => {
  const atmosphere = useAtmosphere()
  const history = useHistory()
  const isNaggingPath = getIsNaggingPath(history)
  useEffect(() => {
    if (!isNaggingPath || !insights) return
    emitNag(atmosphere, history)
  }, [isNaggingPath, insights])
}

export default useUsageSnackNag

import ms from 'ms'
import {useEffect} from 'react'
import Atmosphere from '../Atmosphere'
import useAtmosphere from './useAtmosphere'

const NAG_EVERY = ms('3m')
const emitNag = (atmosphere: Atmosphere, overLimitCopy: string) => {
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'overLimit',
    message: overLimitCopy,
    autoDismiss: 0,
    noDismissOnClick: true,
    action: {
      label: 'Dismiss',
      callback: () => {
        atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'overLimit')
        setTimeout(() => {
          emitNag(atmosphere, overLimitCopy)
        }, NAG_EVERY)
      }
    }
  })
}

const useSnackNag = (overLimitCopy: string | null | undefined) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (!overLimitCopy) return
    emitNag(atmosphere, overLimitCopy)
  }, [overLimitCopy])
}

export default useSnackNag

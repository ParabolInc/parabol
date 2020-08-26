import {useEffect, useRef} from 'react'
import joinRoom from '../utils/room/joinRoom'
import useAtmosphere from './useAtmosphere'

const useRoom = (roomId) => {
  const atmosphere = useAtmosphere()
  const peerId = atmosphere.viewerId
  const disposable = useRef<(() => void) | null>()
  useEffect(() => {
    joinRoom(roomId, peerId, disposable)
    return () => {
      disposable.current && disposable.current()
      disposable.current = null
    }
  }, [roomId, peerId])
}

export default useRoom

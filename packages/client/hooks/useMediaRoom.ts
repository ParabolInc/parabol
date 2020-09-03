import {useEffect, useReducer, useRef} from 'react'
import initMediaRoom from '../utils/mediaRoom/initMediaRoom'
import reducerMediaRoom from '../utils/mediaRoom/reducerMediaRoom'
import {RoomStateEnum} from '../utils/mediaRoom/reducerMediaRoom'
import useAtmosphere from './useAtmosphere'

const initialState = {
  mediaRoom: null,
  room: {
    activeSpeakerId: null,
    state: RoomStateEnum.new
  },
  me: {
    id: null,
    deviceInfo: null
  },
  peers: {},
  producers: {},
  consumers: {}
}

const useMediaRoom = (roomId: string) => {
  const atmosphere = useAtmosphere()
  const peerId = atmosphere.viewerId
  const [state, dispatch] = useReducer(reducerMediaRoom, initialState)
  const disposable = useRef<(() => void) | null>()
  useEffect(() => {
    initMediaRoom(roomId, peerId, disposable, dispatch)
    return () => {
      disposable.current && disposable.current()
      disposable.current = null
    }
  }, [roomId, peerId])
  return state
}

export default useMediaRoom

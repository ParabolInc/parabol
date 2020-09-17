import MediaRoom from './MediaRoom'
import {MutableRefObject, Dispatch, ReducerAction} from 'react'
import reducerMediaRoom from './reducerMediaRoom'

const initMediaRoom = async (
  authToken: string | null,
  teamId: string,
  roomId: string,
  peerId: string,
  disposable: MutableRefObject<(() => void) | undefined | null>,
  dispatch: Dispatch<ReducerAction<typeof reducerMediaRoom>>
) => {
  const mediaRoom = new MediaRoom({roomId, peerId, dispatch, authToken, teamId})
  if (disposable.current === null) return
  disposable.current = mediaRoom.close
  return mediaRoom
}

export default initMediaRoom

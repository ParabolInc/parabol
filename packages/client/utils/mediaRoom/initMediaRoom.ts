import MediaRoom from './MediaRoom'
import {MutableRefObject, Dispatch, ReducerAction} from 'react'
import reducerMediaRoom from './reducerMediaRoom'

const initMediaRoom = async (
  roomId: string,
  peerId: string,
  disposable: MutableRefObject<(() => void) | undefined | null>,
  dispatch: Dispatch<ReducerAction<typeof reducerMediaRoom>>
) => {
  const mediaRoom = new MediaRoom({roomId, peerId, dispatch})
  console.log('Created room:', mediaRoom.roomId, mediaRoom.peerId)
  if (disposable.current === null) return
  disposable.current = mediaRoom.close
  return mediaRoom
}

export default initMediaRoom

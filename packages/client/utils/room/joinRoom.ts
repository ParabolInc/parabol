import Room from './Room'
import {MutableRefObject} from 'react'

const joinRoom = async (
  roomId: string,
  peerId: string,
  disposable: MutableRefObject<(() => void) | undefined | null>
) => {
  const room = new Room({roomId, peerId})
  console.log('Created room:', room.roomId, room.peerId)
  room.connect()
  if (disposable.current === null) return
  disposable.current = room.close
  return room
}

export default joinRoom

import {PeersState, ProducersState, ConsumersState} from '../utils/mediaRoom/reducerMediaRoom'
import {useEffect} from 'react'

interface useMediaSignature {
  kind: 'audio' | 'video'
  mediaRef: React.RefObject<HTMLVideoElement> | React.RefObject<HTMLAudioElement>
  isSelf: boolean
  userId: string
  peers: PeersState
  producers: ProducersState
  consumers: ConsumersState
}

const useMedia = ({
  kind,
  mediaRef,
  isSelf,
  userId,
  peers,
  producers,
  consumers
}: useMediaSignature) => {
  useEffect(() => {
    const mediaSource = isSelf
      ? Object.values(producers).find((producer) => producer.track.kind === kind)
      : peers[userId]?.consumers
          .map((consumerId) => consumers[consumerId])
          .find((consumer) => consumer.track.kind === kind)

    if (mediaSource?.track) {
      const stream = new MediaStream()
      stream.addTrack(mediaSource.track)
      const el = mediaRef.current!
      if (el.srcObject !== stream) el.srcObject = stream! // conditional is required to remove flickering video on update
    }
  })
}

export default useMedia

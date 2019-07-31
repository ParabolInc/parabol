import {useEffect, useRef} from 'react'
import useAtmosphere from './useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {SegmentClientEventEnum} from '../types/graphql'

const useSegmentTrack = (event: SegmentClientEventEnum, options: object) => {
  const initialOptionsRef = useRef(options)
  const atmosphere = useAtmosphere()
  useEffect(() => {
    SendClientSegmentEventMutation(atmosphere, event, initialOptionsRef.current)
  }, [atmosphere, event, initialOptionsRef])
}

export default useSegmentTrack

import {useEffect} from 'react'
import useAtmosphere from './useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {SegmentClientEventEnum} from '../types/graphql'

const useSegmentTrack = (event: SegmentClientEventEnum, options: object) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    SendClientSegmentEventMutation(atmosphere, event, options)
  }, [])
}

export default useSegmentTrack

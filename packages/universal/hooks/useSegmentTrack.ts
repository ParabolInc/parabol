import {useEffect} from 'react'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation'
import {SegmentClientEventEnum} from 'universal/types/graphql'

const useSegmentTrack = (event: SegmentClientEventEnum, options: object) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    SendClientSegmentEventMutation(atmosphere, event, options)
  }, [])
}

export default useSegmentTrack

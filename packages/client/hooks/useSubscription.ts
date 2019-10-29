import {useEffect} from 'react'
import useAtmosphere from './useAtmosphere'
import {Variables} from 'relay-runtime'
import {SubscriptionRequestor} from '../Atmosphere'
import useRouter from './useRouter'

const useSubscription = (
  queryKey: string,
  subscription: SubscriptionRequestor,
  variables: Variables = {}
) => {
  const atmosphere = useAtmosphere()
  const {history, location} = useRouter()
  const context = {history, location}
  useEffect(() => {
    if (atmosphere.registerQuery) {
      atmosphere.registerQuery(queryKey, subscription, variables, context).catch()
    }
    return () => {
      if (atmosphere.scheduleUnregisterQuery) {
        atmosphere.scheduleUnregisterQuery(queryKey, 300000)
      }
    }
  }, [atmosphere, queryKey, subscription, variables])
}

export default useSubscription

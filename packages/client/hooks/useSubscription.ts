import {useEffect} from 'react'
import useAtmosphere from './useAtmosphere'
import {Variables} from 'relay-runtime'
import {SubscriptionRequestor} from '../Atmosphere'
import useRouter from './useRouter'
import useDeepEqual from './useDeepEqual'

const useSubscription = (
  queryKey: string,
  subscription: SubscriptionRequestor,
  inVariables: Variables = {}
) => {
  const atmosphere = useAtmosphere()
  const {history, location} = useRouter()
  const variables = useDeepEqual(inVariables)
  const router = {history, location}
  useEffect(() => {
    if (atmosphere.registerQuery) {
      atmosphere.registerQuery(queryKey, subscription, variables, router).catch()
    }
    return () => {
      if (atmosphere.scheduleUnregisterQuery) {
        atmosphere.scheduleUnregisterQuery(queryKey, 300000)
      }
    }
  }, [atmosphere, queryKey, subscription, variables])
}

export default useSubscription

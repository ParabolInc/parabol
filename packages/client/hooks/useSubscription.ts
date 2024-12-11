import {useEffect} from 'react'
import {SubscriptionRequestor} from '../Atmosphere'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'
import useRouter from './useRouter'

const useSubscription = (
  queryKey: string,
  subscription: SubscriptionRequestor,
  inVariables: any = {}
) => {
  const atmosphere = useAtmosphere()
  const {history, location} = useRouter()
  const variables = useDeepEqual(inVariables)
  const router = {history, location}
  useEffect(() => {
    if (atmosphere.registerQuery) {
      atmosphere.registerQuery(queryKey, subscription, variables, router).catch(() => {
        /*ignore*/
      })
    }
    return () => {
      if (atmosphere.scheduleUnregisterQuery) {
        atmosphere.scheduleUnregisterQuery(queryKey, 300000)
      }
    }
  }, [atmosphere, queryKey, subscription, variables])
}

export default useSubscription

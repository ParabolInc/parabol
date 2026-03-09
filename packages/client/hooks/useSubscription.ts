import {useEffect} from 'react'
import type {SubscriptionRequestor} from '../Atmosphere'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'
import useNavigate from './useNavigate'

const useSubscription = (
  queryKey: string,
  subscription: SubscriptionRequestor,
  inVariables: any = {}
) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const variables = useDeepEqual(inVariables)
  const router = {navigate}
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

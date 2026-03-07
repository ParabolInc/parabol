import {useEffect} from 'react'
import {useHistory, useLocation} from 'react-router'
import type {SubscriptionRequestor} from '../Atmosphere'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'

const useSubscription = (
  queryKey: string,
  subscription: SubscriptionRequestor,
  inVariables: any = {}
) => {
  const atmosphere = useAtmosphere()
  const history = useHistory()
  const location = useLocation()
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

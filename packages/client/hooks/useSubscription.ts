import {useEffect} from 'react'
import {useNavigate} from 'react-router'
import type {Variables} from 'relay-runtime'
import type {SubscriptionRequestor} from '../Atmosphere'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'

const useSubscription = (subscription: SubscriptionRequestor, inVariables: Variables = {}) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const variables = useDeepEqual(inVariables)
  useEffect(
    () => atmosphere.retainSubscription(subscription, variables, {navigate}),
    [atmosphere, subscription, variables]
  )
}

export default useSubscription

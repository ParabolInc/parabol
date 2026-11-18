import {useNavigate} from '@tanstack/react-router'
import {useEffect} from 'react'
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

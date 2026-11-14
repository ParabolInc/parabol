import {useEffect} from 'react'
import {useNavigate} from 'react-router'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import useAtmosphere from './useAtmosphere'

// every page a signed-in user sees follows their notifications, organizations, tasks and teams
const APP_SUBSCRIPTIONS = [
  NotificationSubscription,
  OrganizationSubscription,
  TaskSubscription,
  TeamSubscription
]

const useAppSubscriptions = () => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  useEffect(() => {
    if (!atmosphere.authObj) return
    const releases = APP_SUBSCRIPTIONS.map((subscription) =>
      atmosphere.retainSubscription(subscription, {}, {navigate})
    )
    return () => releases.forEach((release) => release())
  }, [atmosphere])
}

export default useAppSubscriptions

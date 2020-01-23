import React from 'react'
import useRouter from 'hooks/useRouter'
import TopBarIcon from './TopBarIcon'

interface Props {
  hasNotification: boolean
}

const TopBarNotifications = (props: Props) => {
  const {hasNotification} = props
  const {history} = useRouter()
  const gotoNotifications = () => {
    history.push('/me/notifications')
  }
  return (
    <TopBarIcon onClick={gotoNotifications} icon={'notifications'} hasBadge={hasNotification} />
  )
}

export default TopBarNotifications

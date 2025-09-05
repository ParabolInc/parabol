import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import type {
  PageAccessGranted_notification$key,
  PageRoleEnum
} from '../__generated__/PageAccessGranted_notification.graphql'
import useRouter from '../hooks/useRouter'
import NotificationTemplate from './NotificationTemplate'

const pageRoles = {
  owner: 'edit',
  editor: 'edit',
  commenter: 'comment on',
  viewer: 'view'
} as const satisfies Record<PageRoleEnum, string>

interface Props {
  notification: PageAccessGranted_notification$key
}

const PageAccessGranted = (props: Props) => {
  const {notification: notificationRef} = props
  const {history} = useRouter()
  const notification = useFragment(
    graphql`
      fragment PageAccessGranted_notification on NotifyPageAccessGranted {
        ...NotificationTemplate_notification
        id
        ownerName
        ownerPicture
        page {
          id
          title
        }
        role
      }
    `,
    notificationRef
  )
  const {ownerName, ownerPicture, page, role} = notification
  const {id: pageId, title} = page
  const pageAccess = pageRoles[role] ?? 'view'

  const goThere = () => {
    const pageSlug = pageId.split(':')[1]
    history.push(`/pages/${pageSlug}`)
  }

  return (
    <NotificationTemplate
      avatar={ownerPicture}
      message={
        <>
          {ownerName} invited you to <b>{pageAccess}</b> the page <b>{title}</b>
        </>
      }
      notification={notification}
      action={<NotificationAction label={'View page'} onClick={goThere} />}
    />
  )
}

export default PageAccessGranted

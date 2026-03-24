import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import NotificationAction from '~/components/NotificationAction'
import type {
  PageAccessRequested_notification$key,
  PageRoleEnum
} from '../__generated__/PageAccessRequested_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

const pageRoles = {
  owner: 'edit',
  editor: 'edit',
  commenter: 'comment on',
  viewer: 'view'
} as const satisfies Record<PageRoleEnum, string>

interface Props {
  notification: PageAccessRequested_notification$key
}

const PageAccessRequested = (props: Props) => {
  const {notification: notificationRef} = props
  const navigate = useNavigate()
  const notification = useFragment(
    graphql`
      fragment PageAccessRequested_notification on NotifyPageAccessRequested {
        ...NotificationTemplate_notification
        id
        name
        email
        picture
        page {
          id
          title
        }
        role
      }
    `,
    notificationRef
  )
  const {name, email, picture, page, role} = notification
  const {id: pageId, title} = page
  const pageAccess = pageRoles[role] ?? 'view'

  const goThere = () => {
    const pageSlug = pageId.split(':')[1]
    navigate(`/pages/${pageSlug}?share`)
  }

  return (
    <NotificationTemplate
      avatar={picture}
      message={
        <>
          {name}({email}) has requested to <b>{pageAccess}</b> the page <b>{title}</b>
        </>
      }
      notification={notification}
      action={<NotificationAction label={'Review permissions'} onClick={goThere} />}
    />
  )
}

export default PageAccessRequested

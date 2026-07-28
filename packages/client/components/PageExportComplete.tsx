import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import type {PageExportComplete_notification$key} from '../__generated__/PageExportComplete_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: PageExportComplete_notification$key
}

const PageExportComplete = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment PageExportComplete_notification on NotifyPageExportComplete {
        ...NotificationTemplate_notification
        id
        pageExport {
          id
          status
          spaceName
          rootTargetUrl
          pages {
            title
            status
          }
        }
      }
    `,
    notificationRef
  )
  const {pageExport} = notification
  const {status, spaceName, rootTargetUrl, pages} = pageExport
  const rootTitle = pages[0]?.title ?? 'Untitled'
  const successCount = pages.filter(({status: pageStatus}) => pageStatus === 'success').length
  const isSuccess = status === 'success'

  const openInConfluence = () => {
    if (rootTargetUrl) window.open(rootTargetUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <NotificationTemplate
      message={
        isSuccess ? (
          <>
            <b>{rootTitle}</b> was exported to Confluence ({spaceName})
          </>
        ) : (
          <>
            {successCount} of {pages.length} pages of <b>{rootTitle}</b> exported to Confluence (
            {spaceName})
          </>
        )
      }
      notification={notification}
      action={
        rootTargetUrl ? (
          <NotificationAction label={'Open in Confluence'} onClick={openInConfluence} />
        ) : undefined
      }
    />
  )
}

export default PageExportComplete

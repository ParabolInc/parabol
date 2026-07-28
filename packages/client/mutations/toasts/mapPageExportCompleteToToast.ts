import graphql from 'babel-plugin-relay/macro'
import type {mapPageExportCompleteToToast_notification$data} from '../../__generated__/mapPageExportCompleteToToast_notification.graphql'
import type {Snack} from '../../components/Snackbar'
import type {OnNextNavigateContext} from '../../types/relayMutations'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapPageExportCompleteToToast_notification on NotifyPageExportComplete {
    id
    pageExport {
      id
      status
      rootTargetUrl
      spaceName
      pages {
        pageId
        title
        status
      }
    }
  }
`

const mapPageExportCompleteToToast = (
  notification: mapPageExportCompleteToToast_notification$data,
  {navigate}: OnNextNavigateContext
): Snack | null => {
  if (!notification) return null
  const {id: notificationId, pageExport} = notification
  const {status, rootTargetUrl, spaceName, pages} = pageExport
  const rootPage = pages[0]
  if (!rootPage) return null
  const rootTitle = rootPage.title
  const successCount = pages.filter(({status: pageStatus}) => pageStatus === 'success').length

  if (status === 'success') {
    return {
      key: makeNotificationToastKey(notificationId),
      autoDismiss: 10,
      message: `${rootTitle} was exported to Confluence (${spaceName})`,
      action: rootTargetUrl
        ? {
            label: 'Open in Confluence',
            callback: () => {
              window.open(rootTargetUrl, '_blank', 'noopener,noreferrer')
            }
          }
        : undefined
    }
  }
  const pageCode = rootPage.pageId.split(':')[1]
  return {
    key: makeNotificationToastKey(notificationId),
    autoDismiss: 10,
    message: `${successCount} of ${pages.length} pages of ${rootTitle} exported to Confluence`,
    action: {
      label: 'View report',
      callback: () => {
        navigate(`/pages/${pageCode}?export=confluence&report=1`)
      }
    }
  }
}

export default mapPageExportCompleteToToast

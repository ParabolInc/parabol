import {Suspense, useState} from 'react'
import exportToConfluenceModalQuery, {
  type ExportToConfluenceModalQuery
} from '../../__generated__/ExportToConfluenceModalQuery.graphql'
import {useQueryLoaderNowWithRetry} from '../../hooks/useQueryLoaderNow'
import {ExportToConfluenceModal} from './ExportToConfluenceModal'

interface Props {
  pageId: string
  onClose: () => void
  initialReport?: boolean
}

// Mount this component only while the dialog should be open — unmounting closes it
export const ExportToConfluenceRoot = (props: Props) => {
  const {pageId, onClose, initialReport} = props
  const [activeExportId, setActiveExportId] = useState<string | null>(null)
  const [reportDismissed, setReportDismissed] = useState(false)
  const {queryRef, retry} = useQueryLoaderNowWithRetry<ExportToConfluenceModalQuery>(
    exportToConfluenceModalQuery,
    {pageId},
    {fetchPolicy: 'network-only'}
  )
  return (
    <Suspense fallback={null}>
      {queryRef && (
        <ExportToConfluenceModal
          queryRef={queryRef}
          pageId={pageId}
          onClose={onClose}
          initialReport={initialReport && !reportDismissed}
          activeExportId={activeExportId}
          setActiveExportId={setActiveExportId}
          onDismissReport={() => setReportDismissed(true)}
          retry={retry}
        />
      )}
    </Suspense>
  )
}

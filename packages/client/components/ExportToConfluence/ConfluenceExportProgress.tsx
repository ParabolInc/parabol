import {Button} from '../../ui/Button/Button'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {type ExportPage, PageExportRow} from './PageExportRow'

type PageExportData = {
  readonly id: string
  readonly status: string
  readonly rootTargetUrl: string | null | undefined
  readonly pages: readonly ExportPage[]
  readonly errorSummary: string | null | undefined
}

interface Props {
  pageExport: PageExportData
  onBackToForm: () => void
}

export const ConfluenceExportProgress = (props: Props) => {
  const {pageExport, onBackToForm} = props
  const {status, rootTargetUrl, pages, errorSummary} = pageExport
  const isRunning = status === 'running'
  const doneCount = pages.filter(
    ({status: pageStatus}) => pageStatus !== 'pending' && pageStatus !== 'exporting'
  ).length
  const successCount = pages.filter(({status: pageStatus}) => pageStatus === 'success').length

  return (
    <div className='flex flex-col gap-4'>
      <DialogTitle>
        {isRunning
          ? `Exporting ${Math.min(doneCount + 1, pages.length)} of ${pages.length} page${pages.length === 1 ? '' : 's'}…`
          : successCount === pages.length
            ? `${pages.length} page${pages.length === 1 ? '' : 's'} exported`
            : `${successCount} of ${pages.length} pages exported`}
      </DialogTitle>
      <div className='flex max-h-64 flex-col gap-1 overflow-y-auto'>
        {pages.map((page) => (
          <PageExportRow key={page.pageId} page={page} />
        ))}
      </div>
      {isRunning && (
        <p className='m-0 text-fg-muted text-xs'>
          {"You can close this — the export keeps running and you'll see the result here."}
        </p>
      )}
      {!isRunning && errorSummary && (
        <p className='m-0 text-fg-secondary text-xs'>{errorSummary}</p>
      )}
      {!isRunning && (
        <DialogActions>
          <Button variant='outline' size='md' onClick={onBackToForm}>
            Export again
          </Button>
          {rootTargetUrl && (
            <Button
              variant='dialogPrimary'
              size='md'
              onClick={() => window.open(rootTargetUrl, '_blank', 'noopener,noreferrer')}
            >
              Open in Confluence
            </Button>
          )}
        </DialogActions>
      )}
    </div>
  )
}

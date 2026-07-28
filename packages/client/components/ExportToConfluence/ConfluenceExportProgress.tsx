import {useState} from 'react'
import useRetryConfluencePageExportMutation from '../../mutations/useRetryConfluencePageExportMutation'
import {Button} from '../../ui/Button/Button'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {type ExportPage, PageExportRow} from './PageExportRow'

type PageExportData = {
  readonly id: string
  readonly status: string
  readonly rootTargetUrl: string | null | undefined
  readonly pages: readonly ExportPage[]
  readonly degradedItems: readonly {
    readonly blockType: string
    readonly count: number
    readonly treatment: string
  }[]
}

interface Props {
  pageExport: PageExportData
  onBackToForm: () => void
}

export const ConfluenceExportProgress = (props: Props) => {
  const {pageExport, onBackToForm} = props
  const {id: pageExportId, status, rootTargetUrl, pages, degradedItems} = pageExport
  const [showDegraded, setShowDegraded] = useState(false)
  const [executeRetry, retrying] = useRetryConfluencePageExportMutation()
  const isRunning = status === 'running'
  const doneCount = pages.filter(
    ({status: pageStatus}) => pageStatus !== 'pending' && pageStatus !== 'exporting'
  ).length
  const successCount = pages.filter(({status: pageStatus}) => pageStatus === 'success').length
  const degradedCount = degradedItems.reduce((sum, {count}) => sum + count, 0)

  const retryPage = (pageId: string) => {
    if (retrying) return
    executeRetry({variables: {pageExportId, pageId}})
  }

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
          <PageExportRow
            key={page.pageId}
            page={page}
            onRetry={isRunning ? undefined : retryPage}
          />
        ))}
      </div>
      {isRunning && (
        <p className='m-0 text-fg-muted text-xs'>
          You can close this — we&apos;ll notify you when it&apos;s done.
        </p>
      )}
      {!isRunning && degradedCount > 0 && (
        <div className='flex flex-col gap-1'>
          <button
            type='button'
            className='cursor-pointer self-start border-none bg-transparent p-0 text-fg-muted text-xs hover:text-fg-secondary'
            onClick={() => setShowDegraded((val) => !val)}
          >
            {degradedCount} item{degradedCount === 1 ? '' : 's'} exported with reduced fidelity{' '}
            {showDegraded ? '▴' : '▾'}
          </button>
          {showDegraded && (
            <ul className='m-0 list-none p-0 text-fg-secondary text-xs'>
              {degradedItems.map(({blockType, count, treatment}) => (
                <li key={blockType} className='py-0.5'>
                  {count}× {blockType} — {treatment}
                </li>
              ))}
            </ul>
          )}
        </div>
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

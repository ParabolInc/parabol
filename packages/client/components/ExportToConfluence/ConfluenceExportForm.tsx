import {useEffect, useState} from 'react'
import useExportPagesToConfluenceMutation from '../../mutations/useExportPagesToConfluenceMutation'
import {Button} from '../../ui/Button/Button'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {CONFLUENCE_HELP_URL, confluenceExportDestKey} from '../../utils/constants'
import {ConfluenceParentPageSearch} from './ConfluenceParentPageSearch'
import {ConfluenceSpaceSelect, type SpaceOption} from './ConfluenceSpaceSelect'
import {ConfluenceSubPagesField} from './ConfluenceSubPagesField'

type Site = {readonly cloudId: string; readonly name: string; readonly url: string}
type PastExport = {
  readonly spaceName: string
  readonly rootTargetUrl: string | null | undefined
  readonly createdAt: string
}
type StoredDest = {cloudId: string; spaceId: string; spaceName: string; spaceKey?: string}

interface Props {
  pageId: string
  pageTitle: string
  teamId: string | null
  sites: readonly Site[]
  subPages: readonly {readonly id: string; readonly title: string | null | undefined}[]
  lastExport: PastExport | null
  entryPoint: string
  onClose: () => void
  onExported: (pageExportId: string) => void
}

const readDest = (teamId: string | null): StoredDest | null => {
  try {
    const raw = window.localStorage.getItem(confluenceExportDestKey(teamId))
    return raw ? (JSON.parse(raw) as StoredDest) : null
  } catch {
    return null
  }
}

export const ConfluenceExportForm = (props: Props) => {
  const {pageId, pageTitle, teamId, sites, subPages, lastExport, entryPoint, onClose, onExported} =
    props
  const [cloudId, setCloudId] = useState(() => readDest(teamId)?.cloudId ?? sites[0]!.cloudId)
  const activeSite = sites.find((site) => site.cloudId === cloudId) ?? sites[0]!
  const [space, setSpace] = useState<SpaceOption | null>(null)
  const [parentPage, setParentPage] = useState<{id: string; title: string} | null>(null)
  const [includeSubPages, setIncludeSubPages] = useState(true)
  const [executeExport, submitting] = useExportPagesToConfluenceMutation()

  // preselect the remembered destination once the space list resolves inside the select
  const storedDest = readDest(teamId)
  useEffect(() => {
    if (storedDest && storedDest.cloudId !== cloudId) setCloudId(storedDest.cloudId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = () => {
    if (!space || submitting) return
    executeExport({
      variables: {
        pageId,
        includeSubPages: subPages.length > 0 ? includeSubPages : false,
        cloudId: activeSite.cloudId,
        spaceId: space.id,
        spaceName: space.name,
        parentPageId: parentPage?.id ?? null,
        entryPoint
      },
      onCompleted: (res, errors) => {
        if (errors?.length) return
        const pageExport = res.exportPagesToConfluence.pageExport
        window.localStorage.setItem(
          confluenceExportDestKey(teamId),
          JSON.stringify({cloudId: activeSite.cloudId, spaceId: space.id, spaceName: space.name})
        )
        onExported(pageExport.id)
      }
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <DialogTitle>Export to Confluence</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>Where should &quot;{pageTitle}&quot; go?</p>
      {sites.length > 1 && (
        <fieldset className='m-0 flex flex-col gap-1 border-none p-0'>
          <label className='font-semibold text-fg-primary text-sm'>Site</label>
          <select
            className='rounded-md border border-hairline-field bg-surface-input p-2 text-fg-primary text-sm'
            value={cloudId}
            onChange={(e) => {
              setCloudId(e.target.value)
              setSpace(null)
              setParentPage(null)
            }}
          >
            {sites.map((site) => (
              <option key={site.cloudId} value={site.cloudId}>
                {site.name}
              </option>
            ))}
          </select>
        </fieldset>
      )}
      <ConfluenceSpaceSelect
        cloudId={activeSite.cloudId}
        value={space}
        onChange={(nextSpace) => {
          setSpace(nextSpace)
          setParentPage(null)
        }}
        preferredSpaceId={storedDest?.cloudId === activeSite.cloudId ? storedDest.spaceId : null}
      />
      <ConfluenceParentPageSearch
        cloudId={activeSite.cloudId}
        spaceId={space?.id ?? null}
        value={parentPage}
        onChange={setParentPage}
      />
      <ConfluenceSubPagesField
        subPages={subPages}
        includeSubPages={includeSubPages}
        onToggle={() => setIncludeSubPages((val) => !val)}
      />
      {lastExport?.rootTargetUrl && (
        <p className='m-0 text-fg-muted text-xs'>
          Exported to {lastExport.spaceName} ·{' '}
          {new Date(lastExport.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
          })}{' '}
          ·{' '}
          <a
            href={lastExport.rootTargetUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-accent'
          >
            View ↗
          </a>
        </p>
      )}
      <p className='m-0 text-fg-muted text-xs'>
        Images and files are copied as attachments. Some blocks export with reduced fidelity.{' '}
        <a
          href={CONFLUENCE_HELP_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='text-accent'
        >
          What transfers →
        </a>
      </p>
      <DialogActions>
        <Button variant='outline' size='md' onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant='dialogPrimary'
          size='md'
          onClick={onSubmit}
          disabled={!space || submitting}
        >
          Export
        </Button>
      </DialogActions>
    </div>
  )
}

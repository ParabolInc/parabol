import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ConfluenceExportFormQuery} from '../../__generated__/ConfluenceExportFormQuery.graphql'
import useExportPagesToConfluenceMutation from '../../mutations/useExportPagesToConfluenceMutation'
import {Button} from '../../ui/Button/Button'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {ConfluenceExportEmpty} from './ConfluenceExportEmpty'
import {ConfluenceParentPageSearch} from './ConfluenceParentPageSearch'
import {ConfluenceSpaceSelect, type SpaceOption} from './ConfluenceSpaceSelect'
import {ConfluenceSubPagesField} from './ConfluenceSubPagesField'
import {CONFLUENCE_HELP_URL, confluenceExportDestKey} from './confluenceExportConstants'

const query = graphql`
  query ConfluenceExportFormQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            confluenceSites {
              cloudId
              name
              url
            }
          }
        }
      }
    }
  }
`

type PastExport = {
  readonly spaceName: string
  readonly rootTargetUrl: string | null | undefined
  readonly createdAt: string
}
type StoredDest = {cloudId: string; spaceId: string; spaceName: string}

export interface ConfluenceExportFormProps {
  queryRef: PreloadedQuery<ConfluenceExportFormQuery>
  pageId: string
  pageTitle: string
  teamId: string
  subPages: readonly {readonly id: string; readonly title: string | null | undefined}[]
  lastExport: PastExport | null
  onClose: () => void
  onExported: (pageExportId: string) => void
}

const readDest = (teamId: string): StoredDest | null => {
  try {
    const raw = window.localStorage.getItem(confluenceExportDestKey(teamId))
    return raw ? (JSON.parse(raw) as StoredDest) : null
  } catch {
    return null
  }
}

export const ConfluenceExportForm = (props: ConfluenceExportFormProps) => {
  const {queryRef, pageId, pageTitle, teamId, subPages, lastExport, onClose, onExported} = props
  const data = usePreloadedQuery<ConfluenceExportFormQuery>(query, queryRef)
  const sites = data.viewer.teamMember?.integrations.atlassian?.confluenceSites ?? []
  const storedDest = readDest(teamId)
  // only preselect a remembered destination that still belongs to a live site
  const validDest =
    storedDest && sites.some(({cloudId}) => cloudId === storedDest.cloudId) ? storedDest : null
  const [cloudId, setCloudId] = useState(() => validDest?.cloudId ?? sites[0]?.cloudId ?? null)
  const [space, setSpace] = useState<SpaceOption | null>(() =>
    validDest ? {id: validDest.spaceId, name: validDest.spaceName, isPersonal: false} : null
  )
  const [parentPage, setParentPage] = useState<{id: string; title: string} | null>(null)
  const [includeSubPages, setIncludeSubPages] = useState(true)
  const [executeExport, submitting] = useExportPagesToConfluenceMutation()

  if (sites.length === 0) return <ConfluenceExportEmpty />
  const activeSite = sites.find((site) => site.cloudId === cloudId) ?? sites[0]!

  const onSubmit = () => {
    if (!space || submitting) return
    executeExport({
      variables: {
        pageId,
        teamId,
        includeSubPages: subPages.length > 0 ? includeSubPages : false,
        cloudId: activeSite.cloudId,
        spaceId: space.id,
        spaceName: space.name,
        targetParentPageId: parentPage?.id ?? null
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
      <p className='m-0 text-fg-secondary text-sm'>{`Where should "${pageTitle}" go?`}</p>
      {sites.length > 1 && (
        <fieldset className='m-0 flex flex-col gap-1 border-none p-0'>
          <label className='font-semibold text-fg-primary text-sm'>Site</label>
          <select
            className='rounded-md border border-hairline-field bg-surface-input p-2 text-fg-primary text-sm'
            value={activeSite.cloudId}
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
        teamId={teamId}
        cloudId={activeSite.cloudId}
        value={space}
        onChange={(nextSpace) => {
          setSpace(nextSpace)
          setParentPage(null)
        }}
      />
      <ConfluenceParentPageSearch
        teamId={teamId}
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

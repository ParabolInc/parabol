import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ExportToConfluenceModalQuery} from '../../__generated__/ExportToConfluenceModalQuery.graphql'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {ConfluenceConnectState} from './ConfluenceConnectState'
import {ConfluenceEnableState} from './ConfluenceEnableState'
import {ConfluenceExportEmpty} from './ConfluenceExportEmpty'
import {ConfluenceExportForm} from './ConfluenceExportForm'
import {ConfluenceExportProgress} from './ConfluenceExportProgress'
import {deriveConfluenceDialogState} from './deriveConfluenceDialogState'

const query = graphql`
  query ExportToConfluenceModalQuery($pageId: ID!) {
    viewer {
      atlassianConnection {
        id
        hasConfluenceScopes
        confluenceSites {
          cloudId
          name
          url
        }
      }
      teams {
        id
      }
      organizations {
        hasConfluenceExport: featureFlag(featureName: "ConfluenceExport")
      }
      subPages: pages(parentPageId: $pageId, first: 11) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
    public {
      page(pageId: $pageId) {
        id
        title
        deletedBy
        team {
          id
        }
        confluenceExports {
          ...useExportPagesToConfluenceMutation_pageExport @relay(mask: false)
        }
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<ExportToConfluenceModalQuery>
  pageId: string
  onClose: () => void
  entryPoint: string
  initialReport?: boolean
  activeExportId: string | null
  setActiveExportId: (id: string | null) => void
  retry: () => void
}

export const ExportToConfluenceModal = (props: Props) => {
  const {
    queryRef,
    pageId,
    onClose,
    entryPoint,
    initialReport,
    activeExportId,
    setActiveExportId,
    retry
  } = props
  const data = usePreloadedQuery<ExportToConfluenceModalQuery>(query, queryRef)
  const {viewer} = data
  const page = data.public.page
  const connection = viewer.atlassianConnection
  const hasFlag = viewer.organizations.some((org) => org.hasConfluenceExport)
  if (!hasFlag || !page) return null

  const exports = page.confluenceExports
  const reportExportId = initialReport && !activeExportId ? (exports[0]?.id ?? null) : null
  const shownExportId = activeExportId ?? reportExportId
  const activeExport = exports.find(({id}) => id === shownExportId) ?? null
  const state = deriveConfluenceDialogState({connection, activeExport})
  const teamIdForAuth = page.team?.id ?? viewer.teams[0]?.id ?? null

  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent className='z-10'>
        {state === 'S0' && <ConfluenceConnectState teamId={teamIdForAuth} onAuthed={retry} />}
        {state === 'S1' && <ConfluenceEnableState teamId={teamIdForAuth} onAuthed={retry} />}
        {state === 'EMPTY' && <ConfluenceExportEmpty />}
        {state === 'S2' && (
          <ConfluenceExportForm
            pageId={pageId}
            pageTitle={page.title ?? 'Untitled'}
            teamId={page.team?.id ?? null}
            sites={connection!.confluenceSites}
            subPages={viewer.subPages.edges.map(({node}) => node)}
            lastExport={exports[0] ?? null}
            entryPoint={entryPoint}
            onClose={onClose}
            onExported={(id) => {
              setActiveExportId(id)
              retry()
            }}
          />
        )}
        {(state === 'S3' || state === 'S4') && activeExport && (
          <ConfluenceExportProgress
            pageExport={activeExport}
            onBackToForm={() => setActiveExportId(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

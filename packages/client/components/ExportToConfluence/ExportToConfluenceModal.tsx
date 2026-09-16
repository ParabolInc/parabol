import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ExportToConfluenceModalQuery} from '../../__generated__/ExportToConfluenceModalQuery.graphql'
import {getConnectProvider} from '../../integrations/platform/findIntegrationService'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {hasConfluenceScopes} from '../../utils/atlassianScopes'
import {ConfluenceConnectState} from './ConfluenceConnectState'
import {ConfluenceEnableState} from './ConfluenceEnableState'
import {ConfluenceExportFormRoot} from './ConfluenceExportFormRoot'
import {ConfluenceExportProgress} from './ConfluenceExportProgress'
import {deriveConfluenceDialogState} from './deriveConfluenceDialogState'

const query = graphql`
  query ExportToConfluenceModalQuery($pageId: ID!) {
    viewer {
      teams {
        id
        viewerTeamMember {
          services {
            ...findIntegrationService_cloudProvider @relay(mask: false)
          }
          integrations {
            atlassian {
              accessToken
              scope
            }
          }
        }
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
        lastPageExport {
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
  initialReport?: boolean
  activeExportId: string | null
  setActiveExportId: (id: string | null) => void
  onDismissReport: () => void
  retry: () => void
}

export const ExportToConfluenceModal = (props: Props) => {
  const {
    queryRef,
    pageId,
    onClose,
    initialReport,
    activeExportId,
    setActiveExportId,
    onDismissReport,
    retry
  } = props
  const data = usePreloadedQuery<ExportToConfluenceModalQuery>(query, queryRef)
  const {viewer} = data
  const page = data.public.page
  const runningExport = page?.lastPageExport?.status === 'running' ? page.lastPageExport : null
  // an export that is still running is unambiguously the active one, even after the
  // dialog was closed and reopened (the copy promises close-is-safe)
  useEffect(() => {
    if (runningExport && !activeExportId) setActiveExportId(runningExport.id)
  }, [runningExport?.id, activeExportId])
  const hasFlag = viewer.organizations.some((org) => org.hasConfluenceExport)
  if (!hasFlag || !page) return null

  const teamsWithAtlassian = viewer.teams.filter(
    ({viewerTeamMember}) => viewerTeamMember?.integrations.atlassian?.accessToken
  )
  const confluenceTeam =
    teamsWithAtlassian.find(({viewerTeamMember}) =>
      hasConfluenceScopes(viewerTeamMember?.integrations.atlassian?.scope)
    ) ?? null
  const authTeam = confluenceTeam ?? teamsWithAtlassian[0] ?? viewer.teams[0] ?? null
  const heldScopes = authTeam?.viewerTeamMember?.integrations.atlassian?.scope
  const provider = authTeam?.viewerTeamMember
    ? getConnectProvider(authTeam.viewerTeamMember.services, 'jira')
    : null
  const lastExport = page.lastPageExport
  const wantsReport = initialReport && !activeExportId
  const activeExport =
    lastExport &&
    (lastExport.status === 'running' ||
      (activeExportId ? lastExport.id === activeExportId : wantsReport))
      ? lastExport
      : null
  const state = deriveConfluenceDialogState({
    hasAtlassianAuth: teamsWithAtlassian.length > 0,
    hasConfluenceAccess: !!confluenceTeam,
    activeExport
  })

  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent className='z-10'>
        {state === 'connectAtlassian' && (
          <ConfluenceConnectState
            teamId={authTeam?.id ?? null}
            provider={provider}
            heldScopes={heldScopes}
            onAuthed={retry}
          />
        )}
        {state === 'enableConfluence' && (
          <ConfluenceEnableState
            teamId={authTeam?.id ?? null}
            provider={provider}
            heldScopes={heldScopes}
            onAuthed={retry}
          />
        )}
        {state === 'form' && confluenceTeam && (
          <ConfluenceExportFormRoot
            pageId={pageId}
            pageTitle={page.title ?? 'Untitled'}
            teamId={confluenceTeam.id}
            subPages={viewer.subPages.edges.map(({node}) => node)}
            lastExport={lastExport ?? null}
            onClose={onClose}
            onExported={(id) => {
              setActiveExportId(id)
              retry()
            }}
          />
        )}
        {(state === 'exporting' || state === 'report') && activeExport && (
          <ConfluenceExportProgress
            pageExport={activeExport}
            onBackToForm={() => {
              setActiveExportId(null)
              onDismissReport()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

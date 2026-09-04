import graphql from 'babel-plugin-relay/macro'
import jwtDecode from 'jwt-decode'
import {useEffect, useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {AtlassianProviderRow_viewer$key} from '../../../../__generated__/AtlassianProviderRow_viewer.graphql'
import AtlassianProviderLogo from '../../../../AtlassianProviderLogo'
import AtlassianConfigMenu from '../../../../components/AtlassianConfigMenu'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../../../../hooks/useMutationProps'
import {getConnectProvider} from '../../../../integrations/platform/findIntegrationService'
import type {AuthToken} from '../../../../types/AuthToken'
import {ExternalLinks, Providers} from '../../../../types/constEnums'
import AtlassianClientManager, {ERROR_POPUP_CLOSED} from '../../../../utils/AtlassianClientManager'
import {hasJiraScopes} from '../../../../utils/atlassianScopes'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  retry: () => void
  viewer: AtlassianProviderRow_viewer$key
}

const useFreshToken = (accessToken: string | undefined, retry: () => void) => {
  useEffect(() => {
    if (!accessToken) return
    const decodedToken = jwtDecode(accessToken) as AuthToken | null
    const delay = (decodedToken && decodedToken.exp * 1000 - Date.now()) || -1
    if (delay <= 0) return
    const cancel = window.setTimeout(() => {
      retry()
    }, delay)
    return () => {
      window.clearTimeout(cancel)
    }
  }, [accessToken, retry])
}

const AtlassianProviderRow = (props: Props) => {
  const {retry, viewer: viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment AtlassianProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          services {
            ...findIntegrationService_cloudProvider @relay(mask: false)
          }
          integrations {
            atlassian {
              ...AtlassianProviderRowAtlassianIntegration @relay(mask: false)
            }
          }
        }
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, error, onCompleted} = useMutationProps()
  const mutationProps = {
    submitting,
    submitMutation,
    onError,
    onCompleted
  } as MenuMutationProps
  const {teamMember} = viewer
  const {integrations, services} = teamMember!
  const {atlassian} = integrations
  const provider = getConnectProvider(services, 'jira')
  const accessToken = atlassian?.accessToken ?? undefined
  const jiraConnected = !!accessToken && hasJiraScopes(atlassian?.scope)
  useFreshToken(accessToken, retry)
  const openOAuth = () => {
    if (!provider) return
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      provider,
      mutationProps,
      AtlassianClientManager.JIRA_SCOPE,
      atlassian?.scope
    )
  }

  const errorMessage = useMemo(() => {
    if (!error) return undefined
    const {message} = error
    if (message === ERROR_POPUP_CLOSED) {
      return (
        <>
          Having trouble authorizing Parabol? Try our{' '}
          <a
            href={ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_AUTHORIZATION}
            target='_blank'
            rel='noreferrer'
          >
            troubleshooting guide
          </a>
        </>
      )
    }
    return message
  }, [error])

  if (!provider) return null

  return (
    <ProviderRow
      connected={jiraConnected}
      onConnectClick={openOAuth}
      submitting={submitting}
      configMenu={
        <AtlassianConfigMenu
          mutationProps={mutationProps}
          teamId={teamId}
          provider={provider}
          heldScopes={atlassian?.scope}
        />
      }
      providerName={Providers.JIRA_CLOUD_NAME}
      providerDescription={Providers.JIRA_CLOUD_DESC}
      providerLogo={<AtlassianProviderLogo />}
      error={errorMessage}
    />
  )
}

graphql`
  fragment AtlassianProviderRowAtlassianIntegration on AtlassianIntegration {
    accessToken
    scope
  }
`

export default AtlassianProviderRow

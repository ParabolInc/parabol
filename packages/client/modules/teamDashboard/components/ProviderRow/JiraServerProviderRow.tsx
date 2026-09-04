import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {JiraServerProviderRow_viewer$key} from '~/__generated__/JiraServerProviderRow_viewer.graphql'
import JiraServerConfigMenu from '../../../../components/JiraServerConfigMenu'
import JiraServerProviderLogo from '../../../../components/JiraServerProviderLogo'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../../../../hooks/useMutationProps'
import {ExternalLinks, Providers} from '../../../../types/constEnums'
import JiraServerClientManager from '../../../../utils/JiraServerClientManager'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import ProviderRowContactUs from './ProviderRowContactUs'

interface Props {
  teamId: string
  viewerRef: JiraServerProviderRow_viewer$key
}

graphql`
  fragment JiraServerProviderRowTeamMember on TeamMember {
    integrations {
      jiraServer {
        auth {
          id
          isActive
        }
        sharedProviders {
          id
        }
      }
    }
  }
`

const JiraServerProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment JiraServerProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          id
          ...JiraServerProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {
    submitting,
    submitMutation,
    onError,
    onCompleted
  } as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {jiraServer} = integrations
  const isActive = !!jiraServer?.auth?.isActive
  const provider = jiraServer?.sharedProviders[0]

  const openOAuth = () => {
    if (provider) {
      JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
    }
  }

  return (
    <ProviderRowContactUs
      connected={!!(isActive && provider)}
      onConnectClick={openOAuth}
      submitting={submitting}
      configMenu={
        provider && (
          <JiraServerConfigMenu
            mutationProps={mutationProps}
            teamId={teamId}
            providerId={provider.id}
          />
        )
      }
      providerName={Providers.JIRA_SERVER_NAME}
      providerDescription={Providers.JIRA_SERVER_DESC}
      providerLogo={<JiraServerProviderLogo />}
      contactUsUrl={ExternalLinks.INTEGRATIONS_JIRASERVER}
      onContactUsSubmit={() => {
        SendClientSideEvent(atmosphere, 'Clicked Jira Server Request Button')
      }}
      hasProvider={!!provider}
    />
  )
}

export default JiraServerProviderRow

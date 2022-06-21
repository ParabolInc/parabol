import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import GitLabClientManager from '../../../../utils/GitLabClientManager'
import {GitLabProviderRow_viewer$key} from '../../../../__generated__/GitLabProviderRow_viewer.graphql'
import GitLabConfigMenu from './GitLabConfigMenu'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  viewerRef: GitLabProviderRow_viewer$key
}

graphql`
  fragment GitLabProviderRowTeamMember on TeamMember {
    integrations {
      gitlab {
        auth {
          provider {
            scope
          }
        }
        cloudProvider {
          id
          clientId
          serverBaseUrl
        }
      }
    }
  }
`

const GitLabProviderRow = (props: Props) => {
  const {teamId, viewerRef} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting} = mutationProps
  const openOAuth = (providerId: string, clientId: string, serverBaseUrl: string) => {
    GitLabClientManager.openOAuth(
      atmosphere,
      providerId,
      clientId,
      serverBaseUrl,
      teamId,
      mutationProps
    )
  }
  const {
    originRef: menuRef,
    menuPortal,
    menuProps,
    togglePortal
  } = useMenu(MenuPosition.UPPER_RIGHT)

  const viewer = useFragment(
    graphql`
      fragment GitLabProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          ...GitLabProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {gitlab} = integrations
  const {auth, cloudProvider} = gitlab
  if (!cloudProvider) return null
  const {clientId, id: cloudProviderId, serverBaseUrl} = cloudProvider

  return (
    <>
      <ProviderRow
        connected={!!auth}
        onConnectClick={() => openOAuth(cloudProviderId, clientId, serverBaseUrl)}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={menuRef}
        providerName={'GitLab'}
        providerDescription={'Use GitLab Issues from within Parabol'}
        providerLogo={<GitLabProviderLogo />}
      />
      {menuPortal(
        <GitLabConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

export default GitLabProviderRow

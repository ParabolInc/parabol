import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import AzureDevOpsConfigMenu from '../../../../components/AzureDevOpsConfigMenu'
import AzureDevOpsProviderLogo from '../../../../components/AzureDevOpsProviderLogo'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import AzureDevOpsClientManager from '../../../../utils/AzureDevOpsClientManager'
import {AzureDevOpsProviderRow_viewer$key} from '../../../../__generated__/AzureDevOpsProviderRow_viewer.graphql'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  viewerRef: AzureDevOpsProviderRow_viewer$key
}

graphql`
  fragment AzureDevOpsProviderRowTeamMember on TeamMember {
    integrations {
      azureDevOps {
        id
        auth {
          accessToken
        }
        cloudProvider {
          id
          tenantId
          clientId
        }
        sharedProviders {
          id
          tenantId
          clientId
        }
      }
    }
  }
`

const AzureDevOpsProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment AzureDevOpsProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          ...AzureDevOpsProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {azureDevOps} = integrations
  const provider = azureDevOps?.sharedProviders[0] ?? azureDevOps?.cloudProvider
  const accessToken = azureDevOps?.auth?.accessToken ?? undefined
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  if (!provider) return null

  const openOAuth = async () => {
    await AzureDevOpsClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }

  return (
    <>
      <ProviderRow
        connected={!!accessToken}
        onConnectClick={openOAuth}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.AZUREDEVOPS_NAME}
        providerDescription={Providers.AZUREDEVOPS_DESC}
        providerLogo={<AzureDevOpsProviderLogo />}
      />
      {menuPortal(
        <AzureDevOpsConfigMenu
          menuProps={menuProps}
          mutationProps={mutationProps}
          teamId={teamId}
          provider={provider}
        />
      )}
    </>
  )
}

export default AzureDevOpsProviderRow

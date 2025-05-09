import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LinearProviderRow_viewer$key} from '../../../../__generated__/LinearProviderRow_viewer.graphql'
import LinearProviderLogo from '../../../../components/LinearProviderLogo'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import LinearClientManager from '../../../../utils/LinearClientManager'
import LinearConfigMenu from './LinearConfigMenu'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  viewerRef: LinearProviderRow_viewer$key
}

graphql`
  fragment LinearProviderRowTeamMemberIntegrations on TeamMemberIntegrations {
    linear {
      auth {
        accessToken
      }
      cloudProvider {
        id
        clientId
        serverBaseUrl
      }
    }
  }
`

graphql`
  fragment LinearProviderRowTeamMember on TeamMember {
    integrations {
      ...LinearProviderRowTeamMemberIntegrations @relay(mask: false)
    }
  }
`

const LinearProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment LinearProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          ...LinearProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, error, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {linear} = integrations
  const provider = linear?.cloudProvider
  const accessToken = linear?.auth?.accessToken ?? undefined
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  if (!provider) {
    return null
  }

  const openOAuth = () => {
    LinearClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }

  return (
    <>
      <ProviderRow
        connected={!!accessToken}
        onConnectClick={openOAuth}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.LINEAR_NAME}
        providerDescription={Providers.LINEAR_DESC}
        providerLogo={<LinearProviderLogo />}
        error={error?.message}
      />
      {menuPortal(
        <LinearConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

export default LinearProviderRow

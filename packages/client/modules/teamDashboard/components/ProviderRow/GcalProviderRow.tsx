import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GcalProviderRow_viewer$key} from '../../../../__generated__/GcalProviderRow_viewer.graphql'
import GcalConfigMenu from '../../../../components/GcalConfigMenu'
import GcalProviderLogo from '../../../../components/GcalProviderLogo'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import GcalClientManager from '../../../../utils/GcalClientManager'
import ProviderRow from './ProviderRow'

type Props = {
  teamId: string
  viewerRef: GcalProviderRow_viewer$key
}

graphql`
  fragment GcalProviderRowTeamMember on TeamMember {
    integrations {
      gcal {
        auth {
          providerId
        }
        cloudProvider {
          id
          clientId
        }
      }
    }
  }
`

const GcalProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting, error} = mutationProps
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  const viewer = useFragment(
    graphql`
      fragment GcalProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          ...GcalProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer

  if (!teamMember) return null
  const {integrations} = teamMember
  const {gcal} = integrations
  if (!gcal || !gcal.cloudProvider) return null
  const {auth, cloudProvider} = gcal
  const hasAuth = !!auth?.providerId

  const openOAuth = () => {
    const {clientId, id: providerId} = cloudProvider
    GcalClientManager.openOAuth(atmosphere, providerId, clientId, teamId, mutationProps)
  }

  return (
    <>
      <ProviderRow
        connected={hasAuth}
        onConnectClick={openOAuth}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.GCAL_NAME}
        providerDescription={Providers.GCAL_DESC}
        providerLogo={<GcalProviderLogo />}
        error={error?.message}
      />
      {menuPortal(
        <GcalConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

export default GcalProviderRow

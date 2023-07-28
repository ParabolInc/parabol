import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import GcalProviderLogo from '../../../../components/GcalProviderLogo'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import ProviderRow from './ProviderRow'
import GcalConfigMenu from '../../../../components/GcalConfigMenu'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import GCalClientManager from '../../../../utils/GcalClientManager'

type Props = {
  viewerRef: any
  teamId: string
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
  const {submitting} = mutationProps

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
  console.log('🚀 ~ viewer:', viewer)
  const {teamMember} = viewer
  const {integrations} = teamMember
  const {gcal} = integrations
  const {auth, cloudProvider} = gcal
  const hasAuth = auth && auth.providerId

  const openOAuth = () => {
    const {clientId, id: providerId} = cloudProvider
    GCalClientManager.openOAuth(atmosphere, providerId, clientId, teamId, mutationProps)
  }
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

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
      />
      {menuPortal(
        <GcalConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

export default GcalProviderRow

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
import GcalClientManager from '../../../../utils/GcalClientManager'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import GCalClientManager from '../../../../utils/GcalClientManager'

type Props = {
  viewerRef: any
  teamId: string
}

const GcalProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const gcalAuth = false
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting} = mutationProps

  const viewer = useFragment(
    graphql`
      fragment GcalProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            gcal {
              auth {
                providerId
              }
              cloudProvider {
                id
                clientId
                serverBaseUrl
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  // ...GitLabProviderRowTeamMember @relay(mask: false)
  console.log('🚀 ~ viewer:', viewer)
  const {teamMember} = viewer
  const {integrations} = teamMember
  const {gcal} = integrations
  const {auth, cloudProvider} = gcal
  // TODO: implement oauth
  const openOAuth = () => {
    const {clientId, id: providerId, serverBaseUrl} = cloudProvider
    GCalClientManager.openOAuth(atmosphere, providerId, clientId, teamId, mutationProps)
  }
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  return (
    <>
      <ProviderRow
        connected={gcalAuth}
        onConnectClick={openOAuth}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.GCAL_NAME}
        providerDescription={Providers.GCAL_DESC}
        providerLogo={<GcalProviderLogo />}
      />
      {menuPortal(<GcalConfigMenu menuProps={menuProps} mutationProps={mutationProps} />)}
    </>
  )
}

export default GcalProviderRow

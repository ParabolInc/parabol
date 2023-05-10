import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import GitHubConfigMenu from '../../../../components/GitHubConfigMenu'
import GcalProviderLogo from '../../../../components/GcalProviderLogo'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import GitHubClientManager from '../../../../utils/GitHubClientManager'
import {GcalProviderRow_viewer$key} from '../../../../__generated__/GcalProviderRow_viewer.graphql'
import ProviderRow from './ProviderRow'
import GcalConfigMenu from '../../../../components/GcalConfigMenu'

interface Props {
  // teamId: string
  // viewer: GcalProviderRow_viewer$key
}

const GcalProviderRow = (props: Props) => {
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  // const {teamMember} = viewer
  // const {integrations} = teamMember!
  // const {github} = integrations
  const gcalAuth = false
  const openOAuth = () => {
    // GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
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
        providerDescription={Providers.GCAL_DESCRIPTION}
        providerLogo={<GcalProviderLogo />}
      />
      {menuPortal(<GcalConfigMenu menuProps={menuProps} mutationProps={mutationProps} />)}
    </>
  )
}

export default GcalProviderRow

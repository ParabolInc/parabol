import React from 'react'
import GcalProviderLogo from '../../../../components/GcalProviderLogo'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import ProviderRow from './ProviderRow'
import GcalConfigMenu from '../../../../components/GcalConfigMenu'

const GcalProviderRow = () => {
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const gcalAuth = false
  const openOAuth = () => {
    // TODO: implement
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

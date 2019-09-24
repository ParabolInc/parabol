import React, {useEffect, useState} from 'react'
import useModal from '../hooks/useModal'
import CreditCardModal from '../modules/userDashboard/components/CreditCardModal/CreditCardModal'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DiscussPhaseSqueeze_organization} from '__generated__/DiscussPhaseSqueeze_organization.graphql'
import PayLaterMutation from '../mutations/PayLaterMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import WaitingForFacilitatorToPay from './WaitingForFacilitatorToPay'

interface Props {
  isFacilitating: boolean
  organization: DiscussPhaseSqueeze_organization
}

const DiscussPhaseSqueeze = (props: Props) => {
  const {isFacilitating, organization} = props
  const {id: orgId, orgUserCount, showConversionModal} = organization
  const {activeUserCount} = orgUserCount
  const [showLocalModal, setShowLocalModal] = useState(true)
  const showModal = showConversionModal && showLocalModal
  const atmosphere = useAtmosphere()
  const {modalPortal, closePortal, openPortal} = useModal()

  const handlePayLater = () => {
    PayLaterMutation(atmosphere, {orgId})
    setShowLocalModal(false)
  }

  const handlePayNow = () => {
    setShowLocalModal(false)
  }


  useEffect(() => {
    if (showConversionModal) {
      openPortal()
    } else {
      closePortal()
    }
  }, [showModal])

  if (isFacilitating) {
    return modalPortal(<CreditCardModal activeUserCount={activeUserCount} orgId={orgId} actionType={'squeeze'}
                                        handlePayLater={handlePayLater}
                                        handlePayNow={handlePayNow}
                                        closePortal={closePortal} />)
  }
  return modalPortal(<WaitingForFacilitatorToPay />)
}

export default createFragmentContainer(
  DiscussPhaseSqueeze,
  {
    organization: graphql`
      fragment DiscussPhaseSqueeze_organization on Organization {
        id
        showConversionModal
        orgUserCount {
          activeUserCount
        }
      }`
  }
)

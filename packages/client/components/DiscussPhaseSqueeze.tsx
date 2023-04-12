import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {DiscussPhaseSqueeze_meeting$key} from '~/__generated__/DiscussPhaseSqueeze_meeting.graphql'
import {DiscussPhaseSqueeze_organization$key} from '~/__generated__/DiscussPhaseSqueeze_organization.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useModal from '../hooks/useModal'
import CreditCardModal from '../modules/userDashboard/components/CreditCardModal/CreditCardModal'
import {PALETTE} from '../styles/paletteV3'
import WaitingForFacilitatorToPay from './WaitingForFacilitatorToPay'

interface Props {
  meeting: DiscussPhaseSqueeze_meeting$key
  organization: DiscussPhaseSqueeze_organization$key
}

const DiscussPhaseSqueeze = (props: Props) => {
  const {organization: organizationRef, meeting: meetingRef} = props
  const organization = useFragment(
    graphql`
      fragment DiscussPhaseSqueeze_organization on Organization {
        id
        orgUserCount {
          activeUserCount
        }
      }
    `,
    organizationRef
  )
  const meeting = useFragment(
    graphql`
      fragment DiscussPhaseSqueeze_meeting on RetrospectiveMeeting {
        id
        facilitatorUserId
        facilitator {
          preferredName
        }
        showConversionModal
      }
    `,
    meetingRef
  )
  const {id: meetingId, facilitatorUserId, facilitator, showConversionModal} = meeting
  const {id: orgId, orgUserCount} = organization
  const {preferredName: facilitatorName} = facilitator
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isFacilitating = viewerId === facilitatorUserId
  const {activeUserCount} = orgUserCount
  const {modalPortal, closePortal, openPortal} = useModal({
    noClose: true,
    background: PALETTE.SLATE_900_32
  })

  useEffect(() => {
    if (showConversionModal) {
      openPortal()
    } else if (!isFacilitating) {
      closePortal()
    }
  }, [showConversionModal, isFacilitating])

  if (isFacilitating) {
    return modalPortal(
      <CreditCardModal
        activeUserCount={activeUserCount}
        orgId={orgId}
        actionType={'squeeze'}
        closePortal={closePortal}
        meetingId={meetingId}
      />
    )
  }
  return modalPortal(<WaitingForFacilitatorToPay facilitatorName={facilitatorName} />)
}

export default DiscussPhaseSqueeze

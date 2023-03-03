import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgBillingUpgrade_organization$key} from '~/__generated__/OrgBillingUpgrade_organization.graphql'
import DialogTitle from '../../../../components/DialogTitle'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import UpgradeBenefits from '../../../../components/UpgradeBenefits'
import useModal from '../../../../hooks/useModal'
import CreditCardModal from '../CreditCardModal/CreditCardModal'
import OrgBillingReassuranceQuote from './OrgBillingReassuranceQuote'

const Inner = styled('div')({
  margin: '0 auto',
  maxWidth: 312,
  padding: '20px 24px 24px'
})

const Quotes = styled(OrgBillingReassuranceQuote)({
  paddingBottom: 16
})

const ButtonBlock = styled('div')({
  paddingTop: 16
})

const Title = styled(DialogTitle)({
  padding: '0 0 12px'
})

const StyledPrimaryButton = styled(PrimaryButton)({
  display: 'block',
  fontSize: 15,
  height: 40,
  width: '100%'
})

interface Props {
  organization: OrgBillingUpgrade_organization$key
  invoiceListRefetch?: ({orgId, first}: {orgId: string; first: number}) => void
}

const OrgBillingUpgrade = (props: Props) => {
  const {organization: organizationRef, invoiceListRefetch} = props
  const organization = useFragment(
    graphql`
      fragment OrgBillingUpgrade_organization on Organization {
        id
        tier
        orgUserCount {
          activeUserCount
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, tier, orgUserCount} = organization
  const {activeUserCount} = orgUserCount
  const {togglePortal, closePortal, modalPortal} = useModal()
  const onUpgrade = () => invoiceListRefetch?.({orgId, first: 3})
  return (
    <>
      {modalPortal(
        <CreditCardModal
          onUpgrade={onUpgrade}
          actionType={'upgrade'}
          closePortal={closePortal}
          orgId={orgId}
          activeUserCount={activeUserCount}
        />
      )}
      {tier === 'starter' && (
        <Panel>
          <Inner>
            <Title>Upgrade</Title>
            <Quotes />
            <UpgradeBenefits />
            <ButtonBlock>
              <StyledPrimaryButton onClick={togglePortal}>{'Upgrade Now'}</StyledPrimaryButton>
            </ButtonBlock>
          </Inner>
        </Panel>
      )}
    </>
  )
}

export default OrgBillingUpgrade

import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import BillingLeader from './BillingLeader'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth} from '../../../../types/constEnums'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import FlatButton from '../../../../components/FlatButton'
import RowInfo from '../../../../components/Row/RowInfo'
import {useFragment} from 'react-relay'
import {BillingLeaders_organization$key} from '../../../../__generated__/BillingLeaders_organization.graphql'
import IconLabel from '../../../../components/IconLabel'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

const StyledRow = styled(Row)({
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center'
})

const InfoText = styled('span')({
  fontSize: 16,
  padding: '8px 0px',
  color: PALETTE.SLATE_900
})

const StyledButton = styled(FlatButton)({
  width: ElementWidth.BILLING_AVATAR,
  height: ElementWidth.BILLING_AVATAR,
  color: 'inherit',
  ':hover': {
    backgroundColor: 'transparent'
  }
})

const BillingLeaderLabel = styled(RowInfoHeading)({
  color: 'inherit'
})

const ButtonWrapper = styled('div')({
  color: PALETTE.SKY_500,
  flexDirection: 'row',
  display: 'flex',
  ':hover': {
    color: PALETTE.SKY_600,
    cursor: 'pointer'
  }
})

type Props = {
  organizationRef: BillingLeaders_organization$key
}

const BillingLeaders = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment BillingLeaders_organization on Organization {
        billingLeaders {
          id
          ...BillingLeader_user
        }
      }
    `,
    organizationRef
  )
  const {billingLeaders} = organization

  return (
    <StyledPanel label='Billing Leaders'>
      <StyledRow>
        <InfoText>
          {
            'All billing leaders are able to see and update credit card information, change plans, and view invoices.'
          }
        </InfoText>
      </StyledRow>
      {billingLeaders.map((billingLeader, idx) => (
        <BillingLeader
          key={billingLeader.id}
          billingLeaderRef={billingLeader}
          isFirstRow={idx === 0}
        />
      ))}
      <StyledRow>
        <ButtonWrapper>
          <StyledButton>
            <IconLabel iconLarge icon='add' />
          </StyledButton>
          <RowInfo>
            <RowInfoHeader>
              <BillingLeaderLabel>Add Billing Leader</BillingLeaderLabel>
            </RowInfoHeader>
          </RowInfo>
        </ButtonWrapper>
      </StyledRow>
    </StyledPanel>
  )
}

export default BillingLeaders

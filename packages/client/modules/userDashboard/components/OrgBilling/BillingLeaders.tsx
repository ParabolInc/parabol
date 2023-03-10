import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Avatar, Divider} from '@mui/material'
import React, {useEffect, useState} from 'react'
import BillingLeader from './BillingLeader'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {PALETTE} from '../../../../styles/paletteV3'
import {loadStripe} from '@stripe/stripe-js'
import {Elements} from '@stripe/react-stripe-js'
import CreatePaymentIntentMutation from '../../../../mutations/CreatePaymentIntentMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {CreatePaymentIntentMutationResponse} from '../../../../__generated__/CreatePaymentIntentMutation.graphql'
import {CompletedHandler} from '../../../../types/relayMutations'
import {Breakpoint, ElementWidth} from '../../../../types/constEnums'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RoleTag from '../../../../components/Tag/RoleTag'
import RowInfoLink from '../../../../components/Row/RowInfoLink'
import RowActions from '../../../../components/Row/RowActions'
import FlatButton from '../../../../components/FlatButton'
import RowInfo from '../../../../components/Row/RowInfo'
import {useFragment} from 'react-relay'
import {BillingLeaders_organization$key} from '../../../../__generated__/BillingLeaders_organization.graphql'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

const StyledRow = styled(Row)({
  padding: '12px 16px'
})

const Plan = styled('div')({
  lineHeight: '16px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  padding: '0px 16px 16px 16px',
  flexWrap: 'wrap',
  width: '50%',
  overflow: 'hidden'
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  width: '100%',
  padding: '8px 0px 16px 0px'
})

const Subtitle = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  paddingBottom: 8
})

const Content = styled('div')({
  width: '100%'
})

const InputLabel = styled('span')({
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
  paddingBottom: 4,
  color: PALETTE.SLATE_600,
  textTransform: 'uppercase'
})

const InfoText = styled('span')({
  display: 'block',
  fontSize: 16,
  padding: '8px 0px',
  // fontWeight: 600,
  // textAlign: 'left',
  // paddingBottom: 8,
  color: PALETTE.SLATE_900
  // textTransform: 'none'
})

const TotalBlock = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 16
})

const ActiveUserBlock = styled('div')({
  paddingTop: 16
})

const AvatarBlock = styled('div')({
  display: 'none',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    display: 'block',
    marginRight: 16
  }
})

// const StyledRow = styled(Row)({
//   padding: '12px 8px 12px 16px',
//   [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
//     padding: '16px 8px 16px 16px'
//   }
// })

const StyledRowInfo = styled(RowInfo)({
  paddingLeft: 0
})

const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

const MenuToggleBlock = styled('div')({
  marginLeft: 8,
  width: '2rem'
})

// interface Props extends WithMutationProps {
//   billingLeaderCount: number
//   organizationUser: OrgMemberRow_organizationUser
//   organization: OrgMemberRow_organization
// }

const StyledButton = styled(FlatButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledFlatButton = styled(FlatButton)({
  paddingLeft: 16,
  paddingRight: 16
})

const stripePromise = loadStripe(window.__ACTION__.stripe)

type Props = {
  organizationRef: BillingLeaders_organization$key
}

const BillingLeaders = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment BillingLeaders_organization on Organization {
        billingLeaders {
          ... on User {
            id
            ...BillingLeader_user
          }
        }
      }
    `,
    organizationRef
  )
  const {billingLeaders} = organization
  const [clientSecret, setClientSecret] = useState('')
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()

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
    </StyledPanel>
  )
}

export default BillingLeaders

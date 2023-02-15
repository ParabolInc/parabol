import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../../../../styles/paletteV3'
import {upperFirst} from '../../../../utils/upperFirst'
import {OrgPlansAndBillingHeading_organization$key} from '../../../../__generated__/OrgPlansAndBillingHeading_organization.graphql'

const Title = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  height: 28,
  width: '100%'
})

const Subtitle = styled('span')<{isBold?: boolean}>(({isBold}) => ({
  fontWeight: isBold ? 600 : 400
}))

const Wrapper = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  padding: '16px 0px',
  flexWrap: 'wrap'
})

const SubtitleBlock = styled('div')({
  padding: '8px 0px',
  fontSize: 16,
  borderRadius: 2,
  lineHeight: '26px',
  fontWeight: 500
})

type Props = {
  organizationRef: OrgPlansAndBillingHeading_organization$key
}

const OrgPlansAndBillingHeading = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlansAndBillingHeading_organization on Organization {
        name
        tier
      }
    `,
    organizationRef
  )
  const {name, tier} = organization
  const tierName = upperFirst(tier)
  return (
    <Wrapper>
      <Title>{'Plans & Billing'}</Title>
      <SubtitleBlock>
        <Subtitle isBold>{`${name}'s Org `}</Subtitle>
        <Subtitle>{`is currently on the `}</Subtitle>
        <Subtitle isBold>{`${tierName} Plan.`}</Subtitle>
      </SubtitleBlock>
    </Wrapper>
  )
}

export default OrgPlansAndBillingHeading

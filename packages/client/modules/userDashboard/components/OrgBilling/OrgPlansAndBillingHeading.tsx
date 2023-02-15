import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import PlainButton from '../../../../components/PlainButton/PlainButton'
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
  flexWrap: 'wrap',
  maxWidth: 800,
  position: 'relative'
})

const SubtitleBlock = styled('div')({
  padding: '8px 0px',
  fontSize: 16,
  borderRadius: 2,
  lineHeight: '26px',
  fontWeight: 500
})

const StyledIcon = styled(ExpandMore)({
  color: PALETTE.SKY_500,
  height: 20,
  width: 20,
  padding: 0,
  alignContent: 'center'
})

const StyledButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  height: 'fit-content',
  justifyContent: 'center',
  margin: 0,
  padding: 0,
  position: 'absolute',
  right: 0,
  opacity: 1,
  width: 'fit-content'
})

const Label = styled.span({
  display: 'block',
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  textAlign: 'center'
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
      <StyledButton>
        <StyledIcon />
        <Label>{'Plan Details'}</Label>
      </StyledButton>
    </Wrapper>
  )
}

export default OrgPlansAndBillingHeading

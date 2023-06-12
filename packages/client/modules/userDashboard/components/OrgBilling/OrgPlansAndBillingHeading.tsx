import styled from '@emotion/styled'
import {Article} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth} from '../../../../types/constEnums'
import {upperFirst} from '../../../../utils/upperFirst'
import {OrgPlansAndBillingHeading_organization$key} from '../../../../__generated__/OrgPlansAndBillingHeading_organization.graphql'

const Wrapper = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  justifyContent: 'space-between',
  lineHeight: '24px',
  padding: '16px 0px',
  flexWrap: 'wrap',
  maxWidth: ElementWidth.PANEL_WIDTH,
  position: 'relative'
})

const Title = styled('h1')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 20,
  fontWeight: 600,
  margin: 0,
  width: '100%'
})

const Subtitle = styled('span')<{isBold?: boolean}>(({isBold}) => ({
  fontWeight: isBold ? 600 : 400
}))

const SubtitleBlock = styled('p')({
  margin: 0,
  padding: '8px 0px'
})

const StyledIcon = styled('div')({
  color: PALETTE.SKY_500,
  height: 20,
  width: 20,
  padding: 0,
  alignContent: 'center'
})

const StyledButton = styled(PlainButton)({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column'
})

const Label = styled('span')({
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '28px'
})

type Props = {
  organizationRef: OrgPlansAndBillingHeading_organization$key
}

const OrgPlansAndBillingHeading = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlansAndBillingHeading_organization on Organization {
        id
        name
        tier
        showDrawer
      }
    `,
    organizationRef
  )
  const atmosphere = useAtmosphere()
  const {id: orgId, name, tier} = organization
  const tierName = upperFirst(tier)

  const handleClick = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const org = store.get(orgId)
      if (!org) return
      const showDrawer = org.getValue('showDrawer')
      org.setValue(!showDrawer, 'showDrawer')
    })
  }

  return (
    <Wrapper>
      <Title>{'Plans & Billing'}</Title>
      <SubtitleBlock>
        <Subtitle isBold>{name}</Subtitle>
        <Subtitle>{` is currently on the `}</Subtitle>
        <Subtitle isBold>{`${tierName} Plan.`}</Subtitle>
      </SubtitleBlock>
      <StyledButton onClick={handleClick}>
        <StyledIcon>
          <Article />
        </StyledIcon>
        <Label>{'Plan Details'}</Label>
      </StyledButton>
    </Wrapper>
  )
}

export default OrgPlansAndBillingHeading

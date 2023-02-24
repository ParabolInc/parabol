import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import {OrgPage_organization$key} from '../../../../__generated__/OrgPage_organization.graphql'
import OrgNav from '../Organization/OrgNav'
import OrgPlansAndBilling from './OrgPlansAndBilling'

const Container = styled('div')<{isWideScreen: boolean}>(({isWideScreen}) => ({
  padding: '0px 48px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: isWideScreen ? 'center' : 'flex-start'
}))

type Props = {
  organizationRef: OrgPage_organization$key
}

const OrgPage = (props: Props) => {
  const {organizationRef} = props
  const isWideScreen = useBreakpoint(Breakpoint.DASH_BREAKPOINT_WIDEST)
  const organization = useFragment(
    graphql`
      fragment OrgPage_organization on Organization {
        ...OrgNav_organization
        ...OrgPlansAndBilling_organization
      }
    `,
    organizationRef
  )

  // add routing here
  return (
    <Container isWideScreen={isWideScreen}>
      <OrgNav organizationRef={organization} />
      <OrgPlansAndBilling organizationRef={organization} />
    </Container>
  )
}

export default OrgPage

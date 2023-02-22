import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgPage_organization$key} from '../../../../__generated__/OrgPage_organization.graphql'
import OrgNav from '../Organization/OrgNav'
import OrgPlansAndBilling from './OrgPlansAndBilling'

const Container = styled('div')({
  padding: '0px 48px 24px 48px'
})

type Props = {
  organizationRef: OrgPage_organization$key
}

const OrgPage = (props: Props) => {
  const {organizationRef} = props

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
    <Container>
      <OrgNav organizationRef={organization} />
      <OrgPlansAndBilling organizationRef={organization} />
    </Container>
  )
}

export default OrgPage

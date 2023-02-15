import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgPage_organization$key} from '../../../../__generated__/OrgPage_organization.graphql'
import OrgNav from '../Organization/OrgNav'
import OrgPlansAndBilling from './OrgPlansAndBilling'

type Props = {
  organizationRef: OrgPage_organization$key
}

const OrgPage = (props: Props) => {
  const {organizationRef} = props

  const organization = useFragment(
    graphql`
      fragment OrgPage_organization on Organization {
        ...OrgNav_organization
      }
    `,
    organizationRef
  )

  // add routing here
  return (
    <>
      <OrgNav organizationRef={organization} />
      <OrgPlansAndBilling />
    </>
  )
}

export default OrgPage

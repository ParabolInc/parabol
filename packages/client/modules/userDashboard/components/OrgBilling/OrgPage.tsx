import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import OrgNav from '../Organization/OrgNav'
import OrgPlansAndBilling from './OrgPlansAndBilling'

type Props = {
  organizationRef: any // OrgPage_organization$key
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

import React, {Suspense} from 'react'
import {RouteComponentProps} from 'react-router'
import Organization from '../../components/Organization/Organization'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import organizationQuery, {
  OrganizationQuery
} from '../../../../__generated__/OrganizationQuery.graphql'
import {renderLoader} from '../../../../utils/relay/renderLoader'

interface Props extends RouteComponentProps<{orgId: string}> {}

const OrganizationRoot = (props: Props) => {
  const {match} = props
  const {
    params: {orgId}
  } = match
  const queryRef = useQueryLoaderNow<OrganizationQuery>(organizationQuery, {orgId})
  return (
    <Suspense fallback={renderLoader({Loader: <div />})}>
      {queryRef && <Organization queryRef={queryRef} />}
    </Suspense>
  )
}

export default OrganizationRoot

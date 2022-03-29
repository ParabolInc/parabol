import React, {Suspense} from 'react'
import withAtmosphere from '../../../../decorators/withAtmosphere/withAtmosphere'
import Organizations from '../../components/Organizations/Organizations'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import organizationsQuery, {
  OrganizationsQuery
} from '../../../../__generated__/OrganizationsQuery.graphql'

const OrganizationsRoot = () => {
  const queryRef = useQueryLoaderNow<OrganizationsQuery>(organizationsQuery)
  return <Suspense fallback={''}>{queryRef && <Organizations queryRef={queryRef} />}</Suspense>
}

export default withAtmosphere(OrganizationsRoot)

import React, {Suspense} from 'react'
import withAtmosphere from '../../../../decorators/withAtmosphere/withAtmosphere'
import Organizations from '../../components/Organizations/Organizations'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import organizationsQuery, {
  OrganizationsQuery
} from '../../../../__generated__/OrganizationsQuery.graphql'
import {renderLoader} from '../../../../utils/relay/renderFallback'
import {LoaderSize} from '../../../../types/constEnums'

const OrganizationsRoot = () => {
  const queryRef = useQueryLoaderNow<OrganizationsQuery>(organizationsQuery)
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.PANEL})}>
      {queryRef && <Organizations queryRef={queryRef} />}
    </Suspense>
  )
}

export default withAtmosphere(OrganizationsRoot)

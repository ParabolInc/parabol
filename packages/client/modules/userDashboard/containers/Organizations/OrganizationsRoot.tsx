import React, {Suspense} from 'react'
import withAtmosphere from '../../../../decorators/withAtmosphere/withAtmosphere'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../types/constEnums'
import {renderLoader} from '../../../../utils/relay/renderLoader'
import organizationsQuery, {
  OrganizationsQuery
} from '../../../../__generated__/OrganizationsQuery.graphql'
import Organizations from '../../components/Organizations/Organizations'

const OrganizationsRoot = () => {
  const queryRef = useQueryLoaderNow<OrganizationsQuery>(organizationsQuery)
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.PANEL})}>
      {queryRef && <Organizations queryRef={queryRef} />}
    </Suspense>
  )
}

export default withAtmosphere(OrganizationsRoot)

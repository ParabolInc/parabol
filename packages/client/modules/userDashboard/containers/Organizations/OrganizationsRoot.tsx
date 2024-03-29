import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../types/constEnums'
import {Loader} from '../../../../utils/relay/renderLoader'
import organizationsQuery, {
  OrganizationsQuery
} from '../../../../__generated__/OrganizationsQuery.graphql'
import Organizations from '../../components/Organizations/Organizations'

const OrganizationsRoot = () => {
  const queryRef = useQueryLoaderNow<OrganizationsQuery>(organizationsQuery)
  return (
    <Suspense fallback={<Loader size={LoaderSize.PANEL} />}>
      {queryRef && <Organizations queryRef={queryRef} />}
    </Suspense>
  )
}

export default OrganizationsRoot

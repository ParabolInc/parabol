import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import organizationQuery, {
  type OrganizationQuery
} from '../../../../__generated__/OrganizationQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../../utils/relay/renderLoader'
import Organization from '../../components/OrgBilling/Organization'

const OrganizationRoot = () => {
  const {orgId} = useParams({strict: false})
  const queryRef = useQueryLoaderNow<OrganizationQuery>(organizationQuery, {
    orgId: orgId!
  })
  return (
    <Suspense fallback={<Loader />}>{queryRef && <Organization queryRef={queryRef} />}</Suspense>
  )
}

export default OrganizationRoot

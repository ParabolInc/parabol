import {Suspense} from 'react'
import {useParams} from 'react-router'
import organizationQuery, {
  type OrganizationQuery
} from '../../../../__generated__/OrganizationQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../../utils/relay/renderLoader'
import Organization from '../../components/OrgBilling/Organization'

const OrganizationRoot = () => {
  const {orgId} = useParams()
  const queryRef = useQueryLoaderNow<OrganizationQuery>(organizationQuery, {
    orgId: orgId!
  })
  return (
    <Suspense fallback={<Loader />}>{queryRef && <Organization queryRef={queryRef} />}</Suspense>
  )
}

export default OrganizationRoot

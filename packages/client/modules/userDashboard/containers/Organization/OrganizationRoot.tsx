import {Suspense} from 'react'
import {RouteComponentProps} from 'react-router'
import organizationQuery, {
  OrganizationQuery
} from '../../../../__generated__/OrganizationQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../../utils/relay/renderLoader'
import Organization from '../../components/OrgBilling/Organization'

interface Props extends RouteComponentProps<{orgId: string}> {}

const OrganizationRoot = (props: Props) => {
  const {match} = props
  const {
    params: {orgId}
  } = match
  const queryRef = useQueryLoaderNow<OrganizationQuery>(organizationQuery, {orgId})
  return (
    <Suspense fallback={<Loader />}>{queryRef && <Organization queryRef={queryRef} />}</Suspense>
  )
}

export default OrganizationRoot

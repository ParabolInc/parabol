import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Navigate, useLocation} from 'react-router'
import type {ReportsRedirectQuery} from '../../__generated__/ReportsRedirectQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<ReportsRedirectQuery>
}

const query = graphql`
  query ReportsRedirectQuery {
    viewer {
      organizations {
        id
      }
    }
  }
`

const ReportsRedirect = ({queryRef}: Props) => {
  const {viewer} = usePreloadedQuery<ReportsRedirectQuery>(query, queryRef)
  const {search} = useLocation()
  const [org] = viewer.organizations
  if (org) return <Navigate to={`/reports/${org.id}${search}`} replace />
  return (
    <p className='m-0 px-4 pt-4 text-fg-secondary sm:px-8'>
      Join an organization to see its reports.
    </p>
  )
}

export default ReportsRedirect

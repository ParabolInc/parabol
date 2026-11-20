import {useLocation} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import hrefOptions from '~/routing/hrefOptions'
import Redirect from '~/routing/Redirect'
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
      reportsOrganization {
        id
      }
    }
  }
`

const ReportsRedirect = ({queryRef}: Props) => {
  const {viewer} = usePreloadedQuery<ReportsRedirectQuery>(query, queryRef)
  const {searchStr: search} = useLocation()
  const orgId = viewer.reportsOrganization?.id ?? viewer.organizations[0]?.id
  if (orgId) return <Redirect {...hrefOptions(`/reports/${orgId}${search}`)} replace />
  return (
    <p className='m-0 px-4 pt-4 text-fg-secondary sm:px-8'>
      Join an organization to see its reports.
    </p>
  )
}

export default ReportsRedirect

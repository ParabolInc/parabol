import {useLocation} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import hrefOptions from '~/routing/hrefOptions'
import Redirect from '~/routing/Redirect'
import type {ReportsRedirectQuery} from '../../__generated__/ReportsRedirectQuery.graphql'
import {getStoredReportsOrgId} from '../../utils/reportsOrgPreference'
import pickReportsOrg from './pickReportsOrg'

interface Props {
  queryRef: PreloadedQuery<ReportsRedirectQuery>
}

const query = graphql`
  query ReportsRedirectQuery {
    viewer {
      organizations {
        id
        tier
        createdAt
      }
    }
  }
`

const ReportsRedirect = ({queryRef}: Props) => {
  const {viewer} = usePreloadedQuery<ReportsRedirectQuery>(query, queryRef)
  const {searchStr: search} = useLocation()
  const org = pickReportsOrg(viewer.organizations, getStoredReportsOrgId())
  if (org) return <Redirect {...hrefOptions(`/reports/${org.id}${search}`)} replace />
  return (
    <p className='m-0 px-4 pt-4 text-fg-secondary sm:px-8'>
      Join an organization to see its reports.
    </p>
  )
}

export default ReportsRedirect

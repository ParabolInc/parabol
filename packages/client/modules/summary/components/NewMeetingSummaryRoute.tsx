import {getRouteApi, useParams} from '@tanstack/react-router'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import NewMeetingSummary from './NewMeetingSummary'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/new-summary/$meetingId')

const NewMeetingSummaryRoute = () => {
  const {urlAction} = useParams({strict: false})
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <NewMeetingSummary queryRef={queryRef} urlAction={urlAction as 'csv' | undefined} />
}

export default NewMeetingSummaryRoute

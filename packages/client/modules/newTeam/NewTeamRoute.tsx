import {getRouteApi, useParams} from '@tanstack/react-router'
import useQueryRefLease from '../../routing/useQueryRefLease'
import NewTeam from './NewTeam'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/newteam')

const NewTeamRoute = () => {
  const {defaultOrgId} = useParams({strict: false})
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <NewTeam queryRef={queryRef} defaultOrgId={defaultOrgId} />
}

export default NewTeamRoute

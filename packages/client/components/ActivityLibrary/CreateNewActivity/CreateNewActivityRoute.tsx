import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import {CreateNewActivity} from './CreateNewActivity'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/activity-library/new-activity/$categoryId'
)

const CreateNewActivityRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <CreateNewActivity queryRef={queryRef} />
}

export default CreateNewActivityRoute

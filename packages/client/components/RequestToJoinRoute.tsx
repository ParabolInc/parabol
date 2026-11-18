import {useParams} from '@tanstack/react-router'
import RequestToJoinComponent from './RequestToJoin'

const RequestToJoinRoute = () => {
  const {teamId} = useParams({strict: false})
  return <RequestToJoinComponent key={teamId} />
}

export default RequestToJoinRoute

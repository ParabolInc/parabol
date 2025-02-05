import {getCurrentUser} from 'mattermost-redux/selectors/entities/users'
import {useSelector} from 'react-redux'

export const useCurrentUser = () => {
  const user = useSelector(getCurrentUser)
  return {id: user.id, name: user.nickname}
}

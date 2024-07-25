import isValid from '../../isValid'
import {ReactjiResolvers} from '../resolverTypes'

export type ReactjiSource = {
  id: string
  userIds: string[]
  count: number
  isViewerReactji: boolean
}

const Reactji: ReactjiResolvers = {
  users: async ({userIds}, _args, {dataLoader}) => {
    const users = await dataLoader.get('users').loadMany(userIds)
    return users.filter(isValid)
  }
}

export default Reactji

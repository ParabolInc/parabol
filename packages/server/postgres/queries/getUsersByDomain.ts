import {selectUser} from '../select'

const getUsersByDomain = async (domain: string) => {
  return selectUser().where('domain', '=', domain).execute()
}

export default getUsersByDomain

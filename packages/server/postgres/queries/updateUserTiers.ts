import catchAndLog from '../utils/catchAndLog'
import getPg from '../getPg'
import {IUpdateUserTiersQueryParams, updateUserTiersQuery} from './generated/updateUserTiersQuery'

const updateUserTiers = async ({users}: IUpdateUserTiersQueryParams) => {
  if (users.length) {
    await catchAndLog(() => updateUserTiersQuery.run({users}, getPg()))
  }
}

export default updateUserTiers

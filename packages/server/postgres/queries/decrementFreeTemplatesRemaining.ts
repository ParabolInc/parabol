import {USER_DETAIL_DEFAULTS, type UserDetailColumn} from '../../utils/getUserDetail'
import getKysely from '../getKysely'

type FreeTemplatesColumn = Exclude<UserDetailColumn, 'bytesUploaded'>

const decrementFreeTemplatesRemaining = async (userId: string, column: FreeTemplatesColumn) => {
  await getKysely()
    .insertInto('UserDetail')
    .values({id: userId, [column]: USER_DETAIL_DEFAULTS[column] - 1})
    .onConflict((oc) =>
      oc
        .column('id')
        .doUpdateSet((eb) => ({[column]: eb(`UserDetail.${column}`, '-', 1)}))
        .where(`UserDetail.${column}`, '>', 0)
    )
    .execute()
}

export default decrementFreeTemplatesRemaining

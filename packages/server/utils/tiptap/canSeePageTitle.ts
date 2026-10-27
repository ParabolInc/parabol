import getKysely from '../../postgres/getKysely'
import {selectPageTitleReaderIds} from '../../postgres/select'

export const canSeePageTitle = async (userId: string, pageId: number) => {
  const {canSee} = await getKysely()
    .selectNoFrom(({or, exists, selectFrom}) =>
      or([
        exists(
          selectFrom('PageExternalAccess')
            .select('pageId')
            .where('pageId', '=', pageId)
            .where('email', '=', '*')
        ),
        exists(
          selectFrom(selectPageTitleReaderIds(pageId).as('titleReader'))
            .select('titleReader.userId')
            .where('titleReader.userId', '=', userId)
        )
      ]).as('canSee')
    )
    .executeTakeFirstOrThrow()
  return canSee
}

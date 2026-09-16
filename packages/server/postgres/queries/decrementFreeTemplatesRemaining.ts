import {
  DEFAULT_FREE_TEMPLATES,
  FREE_TEMPLATE_COLUMNS,
  type FreeTemplateType
} from '../../utils/getFreeTemplatesRemaining'
import getKysely from '../getKysely'

const decrementFreeTemplatesRemaining = async (userId: string, templateType: FreeTemplateType) => {
  const column = FREE_TEMPLATE_COLUMNS[templateType]
  await getKysely()
    .insertInto('UserDetail')
    .values({id: userId, [column]: DEFAULT_FREE_TEMPLATES - 1})
    .onConflict((oc) =>
      oc
        .column('id')
        .doUpdateSet((eb) => ({[column]: eb(`UserDetail.${column}`, '-', 1)}))
        .where(`UserDetail.${column}`, '>', 0)
    )
    .execute()
}

export default decrementFreeTemplatesRemaining

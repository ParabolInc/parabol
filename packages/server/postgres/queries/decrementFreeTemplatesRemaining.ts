import getKysely from '../getKysely'

const decrementFreeTemplatesRemaining = async (userId: string, templateType: 'retro' | 'poker') => {
  const pg = getKysely()
  const customTemplateType =
    templateType === 'retro'
      ? 'freeCustomRetroTemplatesRemaining'
      : 'freeCustomPokerTemplatesRemaining'

  const userBeforeUpdate = await pg
    .selectFrom('User')
    .select(customTemplateType)
    .where('id', '=', userId)
    .executeTakeFirst()

  if (userBeforeUpdate && userBeforeUpdate[customTemplateType] > 0) {
    await pg
      .updateTable('User')
      .set({
        [customTemplateType]: userBeforeUpdate[customTemplateType] - 1
      })
      .where('id', '=', userId)
      .execute()
  }
}

export default decrementFreeTemplatesRemaining

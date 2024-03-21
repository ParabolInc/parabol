import getKysely from '../getKysely'

const decrementFreeTemplatesRemaining = async (userId: string, templateType: 'retro' | 'poker') => {
  const pg = getKysely()
  const customTemplateType =
    templateType === 'retro'
      ? 'freeCustomRetroTemplatesRemaining'
      : 'freeCustomPokerTemplatesRemaining'

  await pg
    .updateTable('User')
    .set((eb) => ({[customTemplateType]: eb(customTemplateType, '-', 1)}))
    .where('id', '=', userId)
    .where(customTemplateType, '>', 0)
    .executeTakeFirst()
}

export default decrementFreeTemplatesRemaining

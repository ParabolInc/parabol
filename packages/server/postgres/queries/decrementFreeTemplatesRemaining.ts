import getKysely from '../getKysely'

const FREE_TEMPLATE_COLUMNS = {
  retro: 'freeCustomRetroTemplatesRemaining',
  poker: 'freeCustomPokerTemplatesRemaining',
  teamPrompt: 'freeCustomStandupTemplatesRemaining'
} as const

const decrementFreeTemplatesRemaining = async (
  userId: string,
  templateType: keyof typeof FREE_TEMPLATE_COLUMNS
) => {
  const pg = getKysely()
  const customTemplateType = FREE_TEMPLATE_COLUMNS[templateType]

  await pg
    .updateTable('User')
    .set((eb) => ({[customTemplateType]: eb(customTemplateType, '-', 1)}))
    .where('id', '=', userId)
    .where(customTemplateType, '>', 0)
    .executeTakeFirst()
}

export default decrementFreeTemplatesRemaining

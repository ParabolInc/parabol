import getKysely from '../getKysely'

const getMeetingTemplatesByIds = async (ids: readonly string[]) => {
  return getKysely().selectFrom('MeetingTemplate').selectAll().where('id', 'in', ids).execute()
}

export default getMeetingTemplatesByIds

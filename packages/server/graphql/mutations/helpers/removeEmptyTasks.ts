import getKysely from '../../../postgres/getKysely'

const removeEmptyTasks = async (meetingId: string) => {
  const pg = getKysely()
  const removedTasks = await pg
    .deleteFrom('Task')
    .where('meetingId', '=', meetingId)
    .where(({or, eb}) => or([eb('plaintextContent', '=', ''), eb('plaintextContent', 'is', null)]))
    .returning('id')
    .execute()
  return removedTasks.map(({id}) => id)
}

export default removeEmptyTasks

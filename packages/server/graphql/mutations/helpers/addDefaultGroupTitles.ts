import getRethink from '../../../database/rethinkDriver'
import promiseAllPartial from '../../../../client/utils/promiseAllPartial'
import updateSmartGroupTitle from './updateReflectionLocation/updateSmartGroupTitle'
import getGroupSmartTitle from 'parabol-client/utils/autogroup/getGroupSmartTitle'

const getTitleFromReflection = async (reflection) => {
  const {reflectionGroupId} = reflection
  const smartTitle = getGroupSmartTitle([reflection])
  return updateSmartGroupTitle(reflectionGroupId, smartTitle)
}

const addDefaultGroupTitles = async (meeting) => {
  const r = getRethink()
  const {id: meetingId} = meeting
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter((reflection) => {
      return r.and(
        reflection('isActive').eq(true),
        reflection('entities')
          .ne(null)
          .default(false)
      )
    })

  const singleGroupReflections = reflections.filter((reflection) => {
    return (
      reflections.filter(
        (iReflection) => iReflection.reflectionGroupId === reflection.reflectionGroupId
      ).length === 1
    )
  })
  await promiseAllPartial(singleGroupReflections.map(getTitleFromReflection))
  const reflectionGroupIds = singleGroupReflections.map(({reflectionGroupId}) => reflectionGroupId)
  return {meetingId, reflectionGroupIds}
}

export default addDefaultGroupTitles

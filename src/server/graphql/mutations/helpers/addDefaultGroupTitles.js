import getRethink from 'server/database/rethinkDriver';
import promiseAllPartial from 'universal/utils/promiseAllPartial';
import updateGroupTitle from 'server/graphql/mutations/helpers/updateReflectionLocation/updateGroupTitle';
import makeRetroGroupTitle from 'server/graphql/mutations/helpers/makeRetroGroupTitle';

const getTitleFromReflection = async (reflection) => {
  const {meetingId, reflectionGroupId} = reflection;
  const {smartTitle, title} = makeRetroGroupTitle(meetingId, [reflection]);
  return updateGroupTitle(reflectionGroupId, smartTitle, title);
};

const addDefaultGroupTitles = async (meeting) => {
  const r = getRethink();
  const {id: meetingId} = meeting;
  const reflections = await r.table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter((reflection) => {
      return r.and(
        reflection('isActive').eq(true),
        reflection('entities').ne(null).default(false)
      );
    });

  const singleGroupReflections = reflections.filter((reflection) => {
    return reflections.filter((iReflection) => iReflection.reflectionGroupId === reflection.reflectionGroupId).length === 1;
  });
  await promiseAllPartial(singleGroupReflections.map(getTitleFromReflection));
  const reflectionGroupIds = singleGroupReflections.map(({reflectionGroupId}) => reflectionGroupId);
  return {reflectionGroupIds};
};

export default addDefaultGroupTitles;

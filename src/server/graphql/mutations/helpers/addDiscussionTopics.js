import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {DISCUSS, TEAM} from 'universal/utils/constants';
import publish from 'server/utils/publish';
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload';


export const makeDiscussionStage = (reflectionGroupId, meetingId) => ({
  id: shortid.generate(),
  meetingId,
  isComplete: false,
  phaseType: DISCUSS,
  reflectionGroupId
});

const mapGroupsToStages = (reflectionGroups) => {
  const importantReflectionGroups = reflectionGroups.filter((group) => group.voterIds.length > 0);
  // handle edge case that no one votes
  if (importantReflectionGroups.length === 0) return reflectionGroups;
  importantReflectionGroups.sort((a, b) => a.voterIds.length < b.voterIds.length ? 1 : -1);
  return importantReflectionGroups;
};

const addDiscussionTopics = async (meeting, dataLoader, subOptions) => {
  const r = getRethink();
  const now = new Date();
  const {phases, teamId} = meeting;
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS);
  if (!discussPhase) return false;
  const {id: meetingId} = meeting;
  const reflectionGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId);
  const importantReflectionGroups = mapGroupsToStages(reflectionGroups);
  const discussStages = importantReflectionGroups.map((reflectionGroup) => makeDiscussionStage(reflectionGroup.id, meetingId));

  if (!discussStages[0] || !discussPhase.stages[0]) return false;
  // mutative, replaces the placeholder with an actual stage
  discussStages[0].id = discussPhase.stages[0].id;
  discussPhase.stages = discussStages;

  await r.table('NewMeeting')
    .get(meetingId)
    .update({
      phases,
      updatedAt: now
    });
  const data = {teamId, meetingId};
  publish(TEAM, teamId, StartNewMeetingPayload, data, {operationId: subOptions.operationId});
  return true;
};

export default addDiscussionTopics;

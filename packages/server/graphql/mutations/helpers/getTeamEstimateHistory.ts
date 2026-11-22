import type {NotNull} from 'kysely'
import getKysely from '../../../postgres/getKysely'

const MAX_PAST_VOTES = 50
const MAX_STORIES = 500

interface Options {
  teamId: string
  dimensionName: string
  labels: string[]
  repoId: string
  excludeTaskId: string
}

const getTeamEstimateHistory = async (options: Options) => {
  const {teamId, dimensionName, labels, repoId, excludeTaskId} = options
  if (labels.length === 0) return {pastVotes: [], stories: []}
  const pg = getKysely()
  const latestPerTask = pg
    .selectFrom('TaskEstimate')
    .innerJoin('Task', 'Task.id', 'TaskEstimate.taskId')
    .distinctOn('TaskEstimate.taskId')
    .where('Task.teamId', '=', teamId)
    .where('TaskEstimate.name', '=', dimensionName)
    .where('TaskEstimate.label', 'in', labels)
    .where('TaskEstimate.taskId', '!=', excludeTaskId)
    .orderBy('TaskEstimate.taskId')
    .orderBy('TaskEstimate.createdAt', 'desc')
  const [pastVotes, stories] = await Promise.all([
    pg
      .selectFrom(latestPerTask.select(['TaskEstimate.label', 'TaskEstimate.createdAt']).as('vote'))
      .select('label')
      .orderBy('createdAt', 'desc')
      .limit(MAX_PAST_VOTES)
      .execute(),
    pg
      .selectFrom(
        latestPerTask
          .where('TaskEstimate.repoId', '=', repoId)
          .where('TaskEstimate.storyTitle', 'is not', null)
          .select([
            'TaskEstimate.label',
            'TaskEstimate.createdAt',
            'TaskEstimate.storyReference',
            'TaskEstimate.storyTitle',
            'TaskEstimate.storyDescription'
          ])
          .as('story')
      )
      .select(['label', 'storyReference', 'storyTitle', 'storyDescription'])
      .orderBy('createdAt', 'desc')
      .limit(MAX_STORIES)
      .$narrowType<{storyReference: NotNull; storyTitle: NotNull; storyDescription: NotNull}>()
      .execute()
  ])
  return {pastVotes: pastVotes.map(({label}) => label), stories}
}

export default getTeamEstimateHistory

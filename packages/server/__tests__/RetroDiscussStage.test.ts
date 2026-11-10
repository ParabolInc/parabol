import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const startRetro = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation StartRetrospectiveMutation($teamId: ID!) {
        startRetrospective(teamId: $teamId) {
          ... on StartRetrospectiveSuccess {
            meeting {
              id
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })
  return res.data.startRetrospective.meeting.id as string
}

const pointDiscussStageAtGroup = async (
  meetingId: string,
  teamId: string,
  reflectionGroupId: string
) => {
  const pg = getKysely()
  const {phases} = await pg
    .selectFrom('NewMeeting')
    .select('phases')
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  const discussPhase = (phases as {phaseType: string; stages: Record<string, unknown>[]}[]).find(
    (phase) => phase.phaseType === 'discuss'
  )!
  const stage = discussPhase.stages[0]!
  stage.reflectionGroupId = reflectionGroupId
  const discussionId = stage.discussionId as string
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  await pg
    .insertInto('Discussion')
    .values({
      id: discussionId,
      meetingId,
      teamId,
      discussionTopicType: 'reflectionGroup',
      discussionTopicId: reflectionGroupId
    })
    .execute()
  return discussionId
}

test('a task from a retro topic whose reflection group no longer exists still loads its stage', async () => {
  const {cookie, teamId, userId} = await signUp()
  const meetingId = await startRetro(teamId, cookie)
  const missingGroupId = generateUID()
  const discussionId = await pointDiscussStageAtGroup(meetingId, teamId, missingGroupId)

  const created = await sendPublic({
    query: `
      mutation CreateTaskMutation($newTask: CreateTaskInput!) {
        createTask(newTask: $newTask) {
          error {
            message
          }
          task {
            id
          }
        }
      }
    `,
    variables: {newTask: {teamId, userId, meetingId, discussionId, status: 'active'}},
    cookie
  })
  expect(created.data.createTask.error).toBeNull()
  const taskId = created.data.createTask.task.id

  const res = await sendPublic({
    query: `
      query TeamTasks($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            tasks(first: 10) {
              edges {
                node {
                  id
                  discussion {
                    stage {
                      ... on RetroDiscussStage {
                        reflectionGroup {
                          id
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })

  expect(res.errors).toBeUndefined()
  const tasks = res.data.viewer.team.tasks.edges.map(({node}: {node: unknown}) => node)
  expect(tasks).toContainEqual({
    id: taskId,
    discussion: {
      stage: {reflectionGroup: {id: missingGroupId, title: 'Unknown'}}
    }
  })
})

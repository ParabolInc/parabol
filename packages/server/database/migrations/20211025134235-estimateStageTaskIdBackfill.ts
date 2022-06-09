import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import {R} from 'rethinkdb-ts'
import dndNoise from '../../../client/utils/dndNoise'
import convertToTaskContent from '../../../client/utils/draftjs/convertToTaskContent'
import generateUID from '../../generateUID'
import {getTemplateRefsByIds, insertTaskEstimate} from '../../postgres/generatedMigrationHelpers'
import EstimatePhase from '../types/EstimatePhase'

export const up = async function (r: R) {
  const BATCH_SIZE = 1000
  const plaintextContent = `Task imported from jira`
  const content = convertToTaskContent(plaintextContent)
  const updateStagesWithTaskIds = (
    meetingId: string,
    stageIdTaskIdLookup: Record<string, string>
  ) => {
    return r
      .table('NewMeeting')
      .get(meetingId)
      .update((meeting) => ({
        phases: meeting('phases').map((phase) =>
          r.branch(
            phase('phaseType').eq('ESTIMATE'),
            phase.merge({
              stages: phase('stages').map((stage) =>
                r.branch(
                  stage.hasFields('taskId').not(),
                  stage.merge({
                    taskId: r(stageIdTaskIdLookup)(stage('id')).default(stage('serviceTaskId'))
                  }),
                  stage
                )
              )
            }),
            phase
          )
        )
      }))
      .run()
  }

  for (let i = 0; i < 1e6; i++) {
    const skip = i * BATCH_SIZE
    console.log('migrating meeting #', skip)
    const curMeetings = await r
      .table('NewMeeting')
      .filter({meetingType: 'poker'})
      .orderBy('createdAt')
      .skip(skip)
      .limit(BATCH_SIZE)
      .run()
    if (curMeetings.length < 1) break
    //
    const tasksToInsert = []
    const estimatesToInsert = []
    const stageUpdates = curMeetings.map(async (meeting) => {
      const {id: meetingId, teamId, phases, templateRefId} = meeting
      const [templateRef] = await getTemplateRefsByIds([templateRefId])
      const phase = phases.find((phase) => phase.phaseType === 'ESTIMATE') as EstimatePhase
      if (!phase) return
      const {stages} = phase
      const stageIdToTaskId = {} as Record<string, string>
      stages.forEach((stage) => {
        if (stage.taskId) return
        const {
          id: stageId,
          service,
          serviceTaskId,
          creatorUserId,
          finalScore,
          startAt,
          dimensionRefIdx,
          discussionId
        } = stage
        // in case there was a hiccup with pg
        const dimensionName = templateRef?.dimensions?.[dimensionRefIdx]?.name ?? 'Story Points'
        let taskId = serviceTaskId
        if (service === 'jira') {
          const {cloudId, issueKey, projectKey} = JiraIssueId.split(serviceTaskId)
          taskId = generateUID()
          // turn it into a parabol task
          const task = {
            content,
            plaintextContent,
            createdAt: new Date(),
            createdBy: creatorUserId,
            meetingId,
            sortOrder: dndNoise(),
            status: 'future',
            tags: ['archived'],
            teamId,
            integrationHash: serviceTaskId,
            integration: {
              service: 'jira',
              cloudId,
              issueKey,
              projectKey,
              accessUserId: creatorUserId
            },
            userId: creatorUserId,
            id: taskId,
            updatedAt: new Date()
          }
          tasksToInsert.push(task)
          stageIdToTaskId[stageId] = taskId
        }
        if (finalScore !== null && finalScore !== undefined) {
          const estimate = {
            changeSource: 'meeting',
            createdAt: startAt || meeting.createdAt,
            name: dimensionName,
            label: finalScore,
            taskId,
            userId: creatorUserId,
            meetingId,
            stageId,
            discussionId,
            jiraFieldId: null
          }
          estimatesToInsert.push(estimate)
        }
      })
      return updateStagesWithTaskIds(meetingId, stageIdToTaskId)
    })
    try {
      await Promise.all(stageUpdates)
    } catch (e) {
      console.log('error updating stage taskId', e)
    }
    console.log({taskCount: tasksToInsert.length, estimateCount: estimatesToInsert.length})
    try {
      if (tasksToInsert.length > 0) {
        await r.table('Task').insert(tasksToInsert).run()
      }
    } catch (e) {
      console.log('error inserting tasks', e)
    }

    try {
      await Promise.all(estimatesToInsert.map((estimate) => insertTaskEstimate(estimate)))
    } catch (e) {
      console.log('error inserting tasks', e)
    }
  }
}

export const down = async function () {
  // noop. it's just a taskId field & there's no way to discriminate between old vs new
}

import shortid from 'shortid'
import {ACTIVE, DISCUSS, GROUP, REFLECT, VOTE} from '../../utils/constants'
import extractTextFromDraftString from '../../utils/draftjs/extractTextFromDraftString'
import makeDiscussionStage from '../../utils/makeDiscussionStage'
import mapGroupsToStages from '../../utils/makeGroupsToStages'
import taskLookup from './taskLookup'

const removeEmptyReflections = (db) => {
  const reflections = db.reflections.filter((reflection) => reflection.isActive)
  const emptyReflectionGroupIds: string[] = []
  const emptyReflectionIds: string[] = []
  reflections.forEach((reflection) => {
    const text = extractTextFromDraftString(reflection.content)
    if (text.length === 0) {
      emptyReflectionGroupIds.push(reflection.reflectionGroupId)
      emptyReflectionIds.push(reflection.id)
    }
  })
  if (emptyReflectionGroupIds.length > 0) {
    db.reflections
      .filter((reflection) => emptyReflectionIds.includes(reflection.id))
      .forEach((reflection) => {
        reflection.isActive = false
      })
    db.reflectionGroups
      .filter((reflectionGroup) => emptyReflectionGroupIds.includes(reflectionGroup.id))
      .forEach((reflectionGroup) => {
        reflectionGroup.isActive = false
      })
  }
  return {emptyReflectionGroupIds}
}

const addStageToBotScript = (stageId, db, reflectionGroupId) => {
  const reflectionGroup = db.reflectionGroups.find((group) => group.id === reflectionGroupId)
  const {reflections} = reflectionGroup
  const stageTasks = [] as string[]
  reflections.forEach((reflection) => {
    const tasks = taskLookup[reflection.id]
    if (!tasks) return
    stageTasks.push(...tasks)
  })
  const ops = [] as any[]
  stageTasks.forEach((taskContent, idx) => {
    const taskId = `botTask${stageId}:${idx}`
    const botId = idx % 2 === 0 ? 'bot2' : 'bot1'
    ops.push(
      ...[
        {
          op: 'CreateTaskMutation',
          delay: 1000,
          botId,
          variables: {
            newTask: {
              id: taskId,
              // content: taskContent,
              sortOrder: idx,
              status: ACTIVE,
              reflectionGroupId
            }
          }
        },
        {
          op: 'UpdateTaskMutation',
          delay: 3000,
          botId,
          variables: {
            updatedTask: {
              id: taskId,
              content: taskContent
            }
          }
        }
      ]
    )
  })
  db._botScript[stageId] = ops
}

const addDiscussionTopics = (db) => {
  const meeting = db.newMeeting
  const {id: meetingId, phases} = meeting
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS)
  if (!discussPhase) return {}
  const placeholderStage = discussPhase.stages[0]

  // const importantReflectionGroups = mapGroupsToStages(db.reflectionGroups)
  const sortedReflectionGroups = db.reflectionGroups.sort((a, b) =>
    a.voterIds.length < b.voterIds.length ? 1 : -1
  )
  const nextDiscussStages = sortedReflectionGroups.map((reflectionGroup, idx) => {
    const id = idx === 0 ? placeholderStage.id : shortid.generate()
    const discussStage = makeDiscussionStage(reflectionGroup.id, meetingId, idx, id)
    addStageToBotScript(id, db, reflectionGroup.id)
    return Object.assign(discussStage, {
      __typename: 'RetroDiscussStage',
      reflectionGroup
    })
  })
  const firstDiscussStage = nextDiscussStages[0]
  if (!firstDiscussStage || !placeholderStage) return {}
  discussPhase.stages = nextDiscussStages
  return {meetingId, discussPhaseStages: nextDiscussStages}
}

const handleCompletedDemoStage = async (db, stage) => {
  if (stage.phaseType === REFLECT) {
    const data = removeEmptyReflections(db)
    return {[REFLECT]: data, [GROUP]: null, [VOTE]: null}
  } else if (stage.phaseType === VOTE) {
    const data = addDiscussionTopics(db)
    return {[REFLECT]: null, [GROUP]: null, [VOTE]: data}
  }
  return {}
}

export default handleCompletedDemoStage

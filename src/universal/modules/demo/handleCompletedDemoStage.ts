import shortid from 'shortid'
import {ACTIVE, DISCUSS, GROUP, REFLECT, VOTE} from 'universal/utils/constants'
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString'
import makeDiscussionStage from 'universal/utils/makeDiscussionStage'
import mapGroupsToStages from 'universal/utils/makeGroupsToStages'
import {demoMeetingId, demoViewerId} from './initDB'
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

const entityLookup = {
  refx: {
    entities: [
      {
        lemma: 'foo',
        name: 'Foo',
        salience: 1
      }
    ],
    title: 'Foo'
    // smartTitle: 'Foo'
  }
}

const getDemoEntities = async (texts) => {
  if (texts.length === 0) return []
  const res = await window.fetch('/get-demo-entities', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({texts})
  })
  if (res.status === 200) return res.json()
  return texts.map(() => [])
}

const addEntitiesToReflections = async (db) => {
  const userReflections = db.reflections.filter(
    (reflection) => reflection.creatorId === demoViewerId
  )
  const contentTexts = userReflections.map((reflection) =>
    extractTextFromDraftString(reflection.content)
  )

  if (contentTexts.length > 0) {
    const computedEntities = await getDemoEntities(contentTexts)
    userReflections.forEach((reflection, idx) => {
      reflection.entities = computedEntities[idx]
    })
  }

  db.reflections
    .filter((reflection) => reflection.creatorId !== demoViewerId)
    .forEach((reflection) => {
      reflection.entities = entityLookup[reflection.id]
    })
}

const addDefaultGroupTitles = (db) => {
  const reflectionGroupIds = db.reflectionGroups
    .filter((group) => group.reflections.length === 1)
    .map((group) => {
      const [reflection] = group.reflections
      const title =
        entityLookup[reflection.id] || extractTextFromDraftString(reflection.content).slice(0, 20)
      group.title = title
      group.smartTitle = title
      return group.id
    })
  return {meetingId: demoMeetingId, reflectionGroupIds}
}

const addStageToBotScript = (stageId, db, reflectionGroupId) => {
  const reflectionGroup = db.reflectionGroups.find((group) => group.id === reflectionGroupId)
  const {reflections} = reflectionGroup
  const stageTasks = [] as Array<string>
  reflections.forEach((reflection) => {
    const tasks = taskLookup[reflection.id]
    if (!tasks) return
    stageTasks.push(...tasks)
  })
  const ops = [] as Array<any>
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
          delay: 2000,
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

  const importantReflectionGroups = mapGroupsToStages(db.reflectionGroups)
  const nextDiscussStages = importantReflectionGroups.map((reflectionGroup, idx) => {
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
    await addEntitiesToReflections(db)
    return {[REFLECT]: data, [GROUP]: null, [VOTE]: null}
  } else if (stage.phaseType === GROUP) {
    const data = addDefaultGroupTitles(db)
    return {[REFLECT]: null, [GROUP]: data, [VOTE]: null}
  } else if (stage.phaseType === VOTE) {
    const data = addDiscussionTopics(db)
    return {[REFLECT]: null, [GROUP]: null, [VOTE]: data}
  }
  return {}
}

export default handleCompletedDemoStage

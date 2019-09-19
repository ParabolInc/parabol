import shortid from 'shortid'
import {ACTIVE, DISCUSS, GROUP, REFLECT, VOTE} from '../../utils/constants'
import extractTextFromDraftString from '../../utils/draftjs/extractTextFromDraftString'
import makeDiscussionStage from '../../utils/makeDiscussionStage'
import mapGroupsToStages from '../../utils/makeGroupsToStages'
import {demoMeetingId, demoViewerId} from './initDB'
import taskLookup from './taskLookup'
import getGroupSmartTitle from '../../utils/autogroup/getGroupSmartTitle'

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
  botRef1: {
    entities: [
      {name: 'interns', salience: 0.4269771873950958, lemma: 'intern'},
      {name: 'staff', salience: 0.18973742425441742, lemma: 'staff'},
      {name: 'ideas', salience: 0.15373969078063965, lemma: 'idea'},
      {name: 'space', salience: 0.1350443959236145, lemma: 'space'},
      {name: 'thinking', salience: 0.09450128674507141, lemma: 'thinking'}
    ]
  },
  botRef2: {
    entities: [{name: 'processes', salience: 1, lemma: 'process'}]
  },
  botRef3: {
    entities: [
      {name: 'people', salience: 0.8546141982078552, lemma: 'person'},
      {name: 'ideas', salience: 0.09340346604585648, lemma: 'idea'},
      {name: 'floor', salience: 0.05198236182332039, lemma: 'floor'}
    ]
  },
  botRef4: {
    entities: [
      {name: 'decisions', salience: 0.6075907349586487, lemma: 'decision'},
      {name: 'chat', salience: 0.39240923523902893, lemma: 'chat'}
    ]
  },
  botRef5: {
    entities: [
      {name: 'debates', salience: 0.8706273436546326, lemma: 'debate'},
      {name: 'group chat', salience: 0.12937262654304504, lemma: 'group chat'}
    ]
  },
  botRef6: {
    entities: [{name: 'meetings', salience: 1, lemma: 'meeting'}]
  },
  botRef7: {
    entities: [
      {name: 'work', salience: 0.7767676711082458, lemma: 'work'},
      {name: 'sprint', salience: 0.22323235869407654, lemma: 'sprint'}
    ]
  },
  botRef8: {
    entities: [{name: 'team', salience: 1, lemma: 'team'}]
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
      reflection.entities = entityLookup[reflection.id].entities
    })
}

const addDefaultGroupTitles = (db) => {
  const reflectionGroupIds = db.reflectionGroups
    .filter((group) => group.reflections.length === 1)
    .map((group) => {
      const smartTitle = getGroupSmartTitle(group.reflections)
      group.title = smartTitle
      group.smartTitle = smartTitle
      return group.id
    })
  return {meetingId: demoMeetingId, reflectionGroupIds}
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

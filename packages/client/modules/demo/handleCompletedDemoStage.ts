import {ReactableEnum} from '~/__generated__/AddReactjiToReactableMutation.graphql'
import {ACTIVE, GROUP, REFLECT, VOTE} from '../../utils/constants'
import extractTextFromDraftString from '../../utils/draftjs/extractTextFromDraftString'
import mapGroupsToStages from '../../utils/makeGroupsToStages'
import clientTempId from '../../utils/relay/clientTempId'
import commentLookup from './commentLookup'
import DemoDiscussStage from './DemoDiscussStage'
import {RetroDemoDB} from './initDB'
import reactjiLookup from './reactjiLookup'
import taskLookup from './taskLookup'

const removeEmptyReflections = (db: RetroDemoDB) => {
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
  return {emptyReflectionGroupIds, reflectionGroups: db.reflectionGroups}
}

const addStageToBotScript = (stageId: string, db: RetroDemoDB, reflectionGroupId: string) => {
  const reflectionGroup = db.reflectionGroups.find((group) => group.id === reflectionGroupId)!
  const {reflections} = reflectionGroup
  const stageTasks = [] as string[]
  const reactions = [] as {
    reactableType: ReactableEnum
    reactableId: string
    reactji: string
  }[]
  const comments = [] as string[]
  const discussionId = `discussion:${reflectionGroupId}`
  reflections.forEach((reflection) => {
    const tasks = taskLookup[reflection.id as keyof typeof taskLookup]
    if (tasks) {
      stageTasks.push(...tasks)
    }
    const reactjis = reactjiLookup[reflection.id as keyof typeof reactjiLookup]
    if (!!reactjis) {
      reactions.push(
        ...reactjis.map((reactji) => ({
          reactableType: 'REFLECTION' as ReactableEnum,
          reactableId: reflection.id,
          reactji
        }))
      )
    }
    const comment = commentLookup[reflection.id as keyof typeof commentLookup]
    if (Array.isArray(comment)) {
      // I think this was a bug before...
      comments.push(...comment)
    }
  })
  const ops = [] as any[]
  reactions.forEach((variables) => {
    const baseOp = {
      op: 'AddReactjiToReactableMutation',
      delay: 1000,
      variables
    }
    if (Math.random() > 0.1) {
      ops.push({...baseOp, botId: 'bot1'})
    }
    if (Math.random() > 0.6) {
      ops.push({...baseOp, botId: 'bot2'})
    }
  })
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
              sortOrder: idx,
              status: ACTIVE,
              discussionId,
              threadParentId: null,
              threadSortOrder: idx
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
  comments.forEach((comment) => {
    ops.push({
      op: 'EditCommentingMutation',
      delay: 1000,
      botId: 'bot1',
      variables: {
        isCommenting: true,
        discussionId
      }
    })
    ops.push({
      op: 'EditCommentingMutation',
      delay: 1000,
      botId: 'bot1',
      variables: {
        isCommenting: false,
        discussionId
      }
    })
    ops.push({
      op: 'AddCommentMutation',
      botId: 'bot1',
      variables: {
        comment: {
          content: comment,
          discussionId,
          threadSortOrder: 1
        }
      }
    })
  })

  ops.push({
    op: 'FlagReadyToAdvanceMutation',
    delay: 1000,
    botId: 'bot1',
    variables: {
      stageId,
      isReady: true
    }
  })
  ops.push({
    op: 'FlagReadyToAdvanceMutation',
    delay: 2000,
    botId: 'bot2',
    variables: {
      stageId,
      isReady: true
    }
  })
  db._botScript[stageId as keyof typeof db['_botScript']] = ops
}

const addDiscussionTopics = (db: RetroDemoDB) => {
  const meeting = db.newMeeting
  const {id: meetingId, phases} = meeting
  const discussPhase = phases?.find((phase) => phase.phaseType === 'discuss')
  const placeholderStage = discussPhase?.stages?.[0]
  if (!placeholderStage) return {}
  const sortedReflectionGroups = mapGroupsToStages(db.reflectionGroups)
  ;(placeholderStage as any).discussionId = `discussion:${sortedReflectionGroups[0]?.id}`
  const nextDiscussStages = sortedReflectionGroups.map((reflectionGroup, idx) => {
    const id = idx === 0 ? placeholderStage.id : clientTempId()
    addStageToBotScript(id, db, reflectionGroup.id)
    const discussionId = `discussion:${reflectionGroup.id}`
    const stage = new DemoDiscussStage(id, idx, reflectionGroup, discussionId, db)
    stage.isNavigable = true
    stage.isNavigableByFacilitator = true
    return stage
  })
  const firstDiscussStage = nextDiscussStages[0]
  if (!firstDiscussStage || !placeholderStage) return {}
  ;(discussPhase as any).stages = nextDiscussStages
  return {meetingId, discussPhaseStages: nextDiscussStages}
}

const handleCompletedDemoStage = async (db: RetroDemoDB, stage: {phaseType: string}) => {
  if (stage.phaseType === REFLECT) {
    const data = removeEmptyReflections(db)
    return {[REFLECT]: data, [GROUP]: null, [VOTE]: null}
  } else if (stage.phaseType === GROUP) {
    const data = removeEmptyReflections(db)
    return {[REFLECT]: null, [GROUP]: data, [VOTE]: null}
  } else if (stage.phaseType === VOTE) {
    const data = addDiscussionTopics(db)
    return {[REFLECT]: null, [GROUP]: null, [VOTE]: data}
  }
  return {}
}

export default handleCompletedDemoStage

import EventEmitter from 'eventemitter3'
import {Variables} from 'relay-runtime'
import StrictEventEmitter from 'strict-event-emitter-types'
import {
  ICreateReflectionPayload,
  IEditReflectionPayload,
  INewMeetingStage,
  IReflectPhase,
  IRetroReflection,
  IRetroReflectionGroup
} from 'universal/types/graphql'
import {GROUP, TEAM} from 'universal/utils/constants'
import unlockAllStagesForPhase from 'universal/utils/unlockAllStagesForPhase'
import initDB, {demoMeetingId, demoViewerId} from './initDB'

// type Tables = 'users' | 'teamMembers' | 'meetingMembers' | 'newMeetings'

type PhaseId = 'checkinPhase' | 'reflectPhase' | 'groupPhase' | 'votePhase' | 'discussPhase'

interface DemoEvents {
  team: IEditReflectionPayload | ICreateReflectionPayload
}

type GQLDemoEmitter = {new (): StrictEventEmitter<EventEmitter, DemoEvents>}

let tempID = 1
const getTempID = (prefix) => {
  return `${prefix}${tempID++}`
}

class ClientGraphQLServer extends (EventEmitter as GQLDemoEmitter) {
  db = initDB()
  getUnlockedStages (stageIds: Array<string>) {
    let unlockedStages = [] as Array<INewMeetingStage>
    this.db.newMeeting.phases!.forEach((phase) => {
      (phase.stages as any).forEach((stage) => {
        if (stageIds.includes(stage.id)) {
          unlockedStages.push(stage)
        }
      })
    })
    return unlockedStages
  }

  ops = {
    RetroRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          team: this.db.team
        }
      }
    },
    CreateReflectionMutation: ({input: {content, retroPhaseItemId, sortOrder}}, userId) => {
      const now = new Date().toJSON()
      const reflectPhase = this.db.newMeeting.phases![1] as IReflectPhase
      const phaseItem = reflectPhase.reflectPrompts.find((prompt) => prompt.id === retroPhaseItemId)
      const reflectionGroupId = getTempID('refGroup')

      const reflection = {
        __typename: 'RetroReflection',
        id: getTempID('ref'),
        createdAt: now,
        creatorId: demoViewerId,
        content,
        editorIds: [],
        isActive: true,
        isViewerCreator: userId === demoViewerId,
        meetingId: demoMeetingId,
        phaseItem,
        reflectionGroupId,
        retroPhaseItemId,
        sortOrder: 0,
        updatedAt: now
      } as Partial<IRetroReflection>

      const reflectionGroup = {
        __typename: 'RetroReflectionGroup',
        id: reflectionGroupId,
        createdAt: now,
        isActive: true,
        meetingId: demoMeetingId,
        meeting: this.db.newMeeting,
        phaseItem,
        retroPhaseItemId,
        reflections: [reflection],
        sortOrder,
        tasks: [],
        updatedAt: now,
        voterIds: []
      } as Partial<IRetroReflectionGroup>

      reflection.retroReflectionGroup = reflectionGroup as any
      this.db.reflectionGroups.push(reflectionGroup)
      this.db.reflections.push(reflection)
      const unlockedStageIds = unlockAllStagesForPhase(
        this.db.newMeeting.phases as any,
        GROUP,
        true
      )
      const unlockedStages = this.getUnlockedStages(unlockedStageIds)
      const data = {
        meetingId: demoMeetingId,
        reflection,
        reflectionId: reflection.id,
        reflectionGroupId,
        reflectionGroup,
        unlockedStageIds,
        unlockedStages,
        __typename: 'CreateReflectionPayload'
      }

      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {createReflection: data}
    },
    EditReflectionMutation: (
      {phaseItemId, isEditing}: {phaseItemId: PhaseId; isEditing: boolean},
      userId
    ) => {
      const data = {
        phaseItemId,
        editorId: userId,
        isEditing,
        __typename: 'EditReflectionPayload'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {editReflection: data}
    },
    RemoveReflectionMutation: ({reflectionId}: {reflectionId: string}, userId: string) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      reflection.isActive = false
      const group = this.db.reflectionGroups.find(
        (group) => group.id === reflection.reflectionGroupId
      )!
      if (group.reflections && group.reflections.length === 1) {
        group.isActive = false
      }
      const remainingReflections = this.db.reflections.filter((reflection) => reflection.isActive)

      const unlockedStageIds = remainingReflections.length
        ? unlockAllStagesForPhase(this.db.newMeeting.phases as any, GROUP, true, false)
        : []
      const unlockedStages = this.getUnlockedStages(unlockedStageIds)
      const data = {
        meetingId: demoMeetingId,
        meeting: this.db.newMeeting,
        reflectionId,
        reflection,
        unlockedStages,
        unlockedStageIds,
        __typename: 'RemoveReflectionMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {removeReflection: data}
    },
    UpdateReflectionContentMutation: ({reflectionId, content}, userId) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      reflection.content = content
      reflection.updatedAt = new Date().toJSON()
      const data = {
        error: null,
        meeting: this.db.newMeeting,
        reflection,
        __typename: 'UpdateReflectionContentMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {updateReflectionContent: data}
    }
  }

  fetch (opName: string, variables: Variables) {
    const resolve = this.ops[opName]
    if (!resolve) {
      console.log('op not found', opName)
      return {
        errors: [{message: `op not found ${opName}`}]
      }
    }
    return {
      data: resolve(variables, demoViewerId)
    }
  }
}

export default ClientGraphQLServer

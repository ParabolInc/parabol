import EventEmitter from 'eventemitter3'
import {parse} from 'flatted'
import ms from 'ms'
import {Variables} from 'relay-runtime'
import StrictEventEmitter from 'strict-event-emitter-types'
import handleCompletedDemoStage from 'universal/modules/demo/handleCompletedDemoStage'
import {
  DragReflectionDropTargetTypeEnum,
  ICreateReflectionPayload,
  IDiscussPhase,
  IEditReflectionPayload,
  INewMeetingStage,
  IReflectPhase,
  IRetroReflection,
  IRetroReflectionGroup,
  NewMeetingPhase
} from 'universal/types/graphql'
import groupReflections from 'universal/utils/autogroup/groupReflections'
import makeRetroGroupTitle from 'universal/utils/autogroup/makeRetroGroupTitle'
import {GROUP, REFLECT, TEAM} from 'universal/utils/constants'
import dndNoise from 'universal/utils/dndNoise'
import findStageById from 'universal/utils/meetings/findStageById'
import startStage_ from 'universal/utils/startStage_'
import unlockAllStagesForPhase from 'universal/utils/unlockAllStagesForPhase'
import unlockNextStages from 'universal/utils/unlockNextStages'
import initDB, {demoMeetingId, demoTeamId, demoViewerId} from './initDB'

type PhaseId = 'checkinPhase' | 'reflectPhase' | 'groupPhase' | 'votePhase' | 'discussPhase'

interface DemoEvents {
  team: IEditReflectionPayload | ICreateReflectionPayload
}

type GQLDemoEmitter = {new (): StrictEventEmitter<EventEmitter, DemoEvents>}

class ClientGraphQLServer extends (EventEmitter as GQLDemoEmitter) {
  db: ReturnType<typeof initDB>
  getTempId = (prefix) => `${prefix}${this.db._tempID++}`

  constructor () {
    super()
    const demoDB = window.localStorage.getItem('retroDemo') || ''
    let validDB
    try {
      validDB = parse(demoDB)
    } catch (e) {
      // noop
    }
    const isStale = !validDB || new Date(validDB._updatedAt).getTime() < Date.now() - ms('5m')
    this.db = isStale ? initDB() : validDB
  }

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
      console.log('team', this.db.team)
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
      const reflectionGroupId = this.getTempId('refGroup')
      const reflectionId = this.getTempId('ref')
      const reflection = {
        __typename: 'RetroReflection',
        id: reflectionId,
        reflectionId,
        createdAt: now,
        creatorId: demoViewerId,
        content,
        dragContext: null,
        editorIds: [],
        isActive: true,
        isEditing: null,
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
        reflectionGroupId,
        title: null,
        viewerVoteCount: 0,
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
    },
    NavigateMeetingMutation: ({completedStageId, facilitatorStageId, meetingId}, userId) => {
      let phaseCompleteData
      let unlockedStageIds
      const meeting = this.db.newMeeting
      const {phases} = meeting
      if (completedStageId) {
        const completedStageRes = findStageById(phases, completedStageId)
        const {stage} = completedStageRes
        if (!stage.isComplete) {
          stage.isComplete = true
          stage.endAt = new Date().toJSON()
          phaseCompleteData = handleCompletedDemoStage(this.db, stage)
        }
      }
      if (facilitatorStageId) {
        const facilitatorStageRes = findStageById(phases, facilitatorStageId)
        const {stage: facilitatorStage} = facilitatorStageRes
        startStage_(facilitatorStage)

        // mutative! sets isNavigable and isNavigableByFacilitator
        unlockedStageIds = unlockNextStages(facilitatorStageId, phases, meetingId)
      }

      const oldFacilitatorStageId = this.db.newMeeting.facilitatorStageId
      Object.assign(this.db.newMeeting, {
        facilitatorStageId,
        updatedAt: new Date().toJSON()
      })

      const data = {
        error: null,
        meetingId,
        meeting: this.db.newMeeting,
        oldFacilitatorStageId,
        oldFacilitatorStage: findStageById(phases, oldFacilitatorStageId).stage,
        facilitatorStageId,
        facilitatorStage: findStageById(phases, facilitatorStageId).stage,
        unlockedStageIds,
        unlockedStages: unlockedStageIds.map((stageId) => findStageById(phases, stageId).stage),
        phaseComplete: phaseCompleteData,
        __typename: 'NavigateMeetingMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {navigateMeeting: data}
    },
    SetPhaseFocusMutation: ({focusedPhaseItemId}, userId) => {
      const reflectPhase = this.db.newMeeting.phases!.find(
        (phase) => phase.phaseType === REFLECT
      ) as IReflectPhase
      reflectPhase.focusedPhaseItemId = focusedPhaseItemId || null
      const data = {
        meetingId: demoMeetingId,
        meeting: this.db.newMeeting,
        reflectPhase,
        __typename: 'SetPhaseFocusMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {setPhaseFocus: data}
    },
    StartDraggingReflectionMutation: ({reflectionId, initialCoords}, userId) => {
      const data = {
        error: null,
        teamId: demoTeamId,
        meetingId: demoMeetingId,
        meeting: this.db.newMeeting,
        reflectionId,
        reflection: this.db.reflections.find((reflection) => reflection.id === reflectionId),
        dragContext: {
          id: this.getTempId('drag'),
          dragUserId: userId,
          dragUser: this.db.users.find((user) => user.id === userId),
          dragCoords: initialCoords
        },
        __typename: 'StartDraggingReflectionMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {startDraggingReflection: data}
    },
    EndDraggingReflectionMutation: (
      {reflectionId, dropTargetType, dropTargetId, dragId},
      userId
    ) => {
      const now = new Date().toJSON()
      let newReflectionGroupId
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      const {reflectionGroupId: oldReflectionGroupId} = reflection
      const oldReflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === oldReflectionGroupId
      )!
      const oldReflections = oldReflectionGroup.reflections!
      if (dropTargetType === DragReflectionDropTargetTypeEnum.REFLECTION_GRID) {
        const {retroPhaseItemId} = reflection
        newReflectionGroupId = this.getTempId('group')
        const newReflectionGroup = {
          __typename: 'RetroReflectionGroup',
          id: newReflectionGroupId,
          reflectionGroupId: newReflectionGroupId,
          title: null,
          viewerVoteCount: 0,
          createdAt: now,
          isActive: true,
          meetingId: demoMeetingId,
          meeting: this.db.newMeeting,
          phaseItem: reflection.phaseItem,
          retroPhaseItemId,
          reflections: [reflection],
          sortOrder: 0,
          tasks: [],
          updatedAt: now,
          voterIds: []
        } as any

        this.db.reflectionGroups.push(newReflectionGroup)
        oldReflections.splice(oldReflections.indexOf(reflection as any), 1)

        Object.assign(reflection, {
          sortOrder: 0,
          reflectionGroupId: newReflectionGroupId,
          updatedAt: now
        })
        this.db.newMeeting.nextAutoGroupThreshold = null
        const {smartTitle: nextGroupSmartTitle, title: nextGroupTitle} = makeRetroGroupTitle([
          reflection
        ])
        newReflectionGroup.smartTitle = nextGroupSmartTitle
        newReflectionGroup.title = nextGroupTitle
        if (oldReflections.length > 0) {
          const {smartTitle: oldGroupSmartTitle, title: oldGroupTitle} = makeRetroGroupTitle(
            oldReflections
          )
          oldReflectionGroup.smartTitle = oldGroupSmartTitle
          if (!oldReflectionGroup.titleIsUserDefined) {
            oldReflectionGroup.title = oldGroupTitle
          }
        } else {
          const meetingGroups = this.db.newMeeting.reflectionGroups!
          meetingGroups.splice(meetingGroups.indexOf(oldReflectionGroup as any), 1)
          Object.assign(oldReflectionGroup, {
            isActive: false,
            updatedAt: now
          })
        }
      } else if (
        dropTargetType === DragReflectionDropTargetTypeEnum.REFLECTION_GROUP &&
        dropTargetId
      ) {
        // group
        const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
        const reflectionGroup = this.db.reflectionGroups.find((group) => group.id === dropTargetId)!
        const sortOrders = this.db.reflections
          .filter((r) => r.reflectionGroupId === dropTargetId)
          .map((r) => (r && r.sortOrder) || 0)
        const maxSortOrder = Math.max(...sortOrders)
        Object.assign(reflection, {
          sortOrder: maxSortOrder + 1 + dndNoise(),
          reflectionGroupId: dropTargetId,
          retroReflectionGroup: reflectionGroup as any,
          updatedAt: now
        })
        reflectionGroup.reflections!.push(reflection as any)
        oldReflections.splice(
          oldReflections.findIndex((reflection) => reflection === reflection),
          1
        )
        if (oldReflectionGroupId !== dropTargetId) {
          const nextReflections = this.db.reflections.filter(
            (reflection) => reflection.reflectionGroupId === dropTargetId
          )
          const oldReflections = this.db.reflections.filter(
            (reflection) => reflection.reflectionGroupId === oldReflectionGroupId
          )
          const {smartTitle: nextGroupSmartTitle, title: nextGroupTitle} = makeRetroGroupTitle(
            nextReflections
          )
          reflectionGroup.smartTitle = nextGroupSmartTitle
          if (!reflectionGroup.titleIsUserDefined) {
            reflectionGroup.title = nextGroupTitle
          }
          const oldReflectionGroup = this.db.reflectionGroups.find(
            (group) => group.id === oldReflectionGroupId
          )!
          if (oldReflections.length > 0) {
            const {smartTitle: oldGroupSmartTitle, title: oldGroupTitle} = makeRetroGroupTitle(
              oldReflections
            )
            oldReflectionGroup.smartTitle = oldGroupSmartTitle
            if (!oldReflectionGroup.titleIsUserDefined) {
              oldReflectionGroup.title = oldGroupTitle
            }
          } else {
            const meetingGroups = this.db.newMeeting.reflectionGroups!
            meetingGroups.splice(meetingGroups.indexOf(oldReflectionGroup as any), 1)
            oldReflectionGroup.isActive = false
            oldReflectionGroup.updatedAt = now
          }
        }
      }

      const data = {
        meetingId: demoMeetingId,
        meeting: this.db.newMeeting,
        reflectionId,
        reflection,
        reflectionGroupId: newReflectionGroupId,
        reflectionGroup: this.db.reflectionGroups.find(
          (group) => group.id === newReflectionGroupId
        ),
        oldReflectionGroupId,
        oldReflectionGroup,
        userId: demoViewerId,
        dropTargetType,
        dropTargetId,
        dragId
      }

      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {endDraggingReflection: data}
    },
    UpdateDragLocationMutation: ({input}, userId) => {
      const {teamId, ...inputData} = input

      const data = {...inputData, userId, __typename: 'UpdateDragLocationMutation'}
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {updateDragLocation: data}
    },
    AutoGroupReflectionsMutation: ({meetingId, groupingThreshold}, userId) => {
      const now = new Date().toJSON()
      const reflections = this.db.reflections.filter((reflection) => reflection.isActive)
      const {
        autoGroupThreshold,
        groupedReflections,
        groups,
        removedReflectionGroupIds,
        nextThresh
      } = groupReflections(reflections, groupingThreshold)
      // this.db.reflectionGroups.forEach((group) => {
      //   if (removedReflectionGroupIds.includes(group.id)) {
      //     group.isActive = false
      //   }
      // })
      removedReflectionGroupIds.forEach((groupId) => {
        const group = this.db.reflectionGroups.find((group) => group.id === groupId)!
        group.isActive = false
        const meetingGroups = this.db.newMeeting.reflectionGroups!
        meetingGroups.splice(meetingGroups.indexOf(group as any), 1)
        group.reflections!.length = 0
      })

      groups.forEach((updatedGroup) => {
        const group = this.db.reflectionGroups.find((group) => group.id === updatedGroup.id)
        Object.assign(group, {
          title: updatedGroup.title,
          smartTitle: updatedGroup.smartTitle,
          updatedAt: now
        })
      })
      groupedReflections.forEach((updatedReflection) => {
        const reflection = this.db.reflections.find((r) => r.id === updatedReflection.id)
        const newGroup = this.db.reflectionGroups.find(
          (group) => group.id === updatedReflection.reflectionGroupId
        )!
        if (!newGroup.reflections!.includes(reflection as any)) {
          newGroup.reflections!.push(reflection as any)
        }
        Object.assign(reflection, {
          autoReflectionGroupId: updatedReflection.reflectionGroupId,
          reflectionGroupId: updatedReflection.reflectionGroupId,
          sortOrder: updatedReflection.sortOrder,
          updatedAt: now
        })
      })
      Object.assign(this.db.newMeeting, {
        autoGroupThreshold,
        nextAutoGroupThreshold: nextThresh
      })

      const reflectionGroupIds = groups.map(({id}) => id)
      const reflectionIds = groupedReflections.map(({id}) => id)
      const data = {
        error: null,
        meeting: this.db.newMeeting,
        meetingId,
        reflections: groupedReflections,
        reflectionGroups: groups,
        removedReflectionGroups: this.db.reflectionGroups.filter((group) =>
          removedReflectionGroupIds.includes(group.id)
        ),
        reflectionGroupIds,
        reflectionIds,
        removedReflectionGroupIds,
        __typename: 'AutoGroupReflectionsMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {autoGroupReflections: data}
    },
    EndNewMeetingMutation: ({meetingId}, userId) => {
      const phases = this.db.newMeeting.phases as Array<NewMeetingPhase>
      const lastPhase = phases[phases.length - 1] as IDiscussPhase
      const currentStage = lastPhase.stages.find((stage) => stage.startAt && !stage.endAt)
      const now = new Date().toJSON()
      if (currentStage) {
        currentStage.isComplete = true
        currentStage.endAt = now
      }

      this.db.team.meetingId = ''
      this.db.newMeeting.endedAt = now

      const data = {
        error: null,
        meeting: this.db.newMeeting,
        meetingId,
        team: this.db.team,
        teamId: demoTeamId,
        isKill: !currentStage,
        __typename: 'EndNewMeetingMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {endNewMeeting: data}
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

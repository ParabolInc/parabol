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
import {DISCUSS, GROUP, REFLECT, TASK, TEAM, VOTE} from 'universal/utils/constants'
import dndNoise from 'universal/utils/dndNoise'
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap'
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr'
import getIsSoftTeamMember from 'universal/utils/getIsSoftTeamMember'
import findStageById from 'universal/utils/meetings/findStageById'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import sleep from 'universal/utils/sleep'
import startStage_ from 'universal/utils/startStage_'
import unlockAllStagesForPhase from 'universal/utils/unlockAllStagesForPhase'
import unlockNextStages from 'universal/utils/unlockNextStages'
import initBotScript from './initBotScript'
import initDB, {
  demoMeetingId,
  demoTeamId,
  demoViewerId,
  GitHubProjectKeyLookup,
  JiraProjectKeyLookup
} from './initDB'
import LocalAtmosphere from './LocalAtmosphere'

interface DemoEvents {
  team: IEditReflectionPayload | ICreateReflectionPayload
  botsFinished: void
}

type GQLDemoEmitter = {new (): StrictEventEmitter<EventEmitter, DemoEvents>}

class ClientGraphQLServer extends (EventEmitter as GQLDemoEmitter) {
  db: ReturnType<typeof initDB>
  getTempId = (prefix) => `${prefix}${this.db._tempID++}`
  pendingBotTimeout: number | undefined
  pendingBotAction?: (() => Array<any>) | undefined

  constructor (public atmosphere: LocalAtmosphere) {
    super()
    const demoDB = window.localStorage.getItem('retroDemo') || ''
    let validDB
    try {
      validDB = parse(demoDB)
    } catch (e) {
      // noop
    }
    // const isStale = true
    const isStale = !validDB || new Date(validDB._updatedAt).getTime() < Date.now() - ms('5m')
    this.db = isStale ? initDB(initBotScript()) : validDB
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

  startBot = () => {
    const facilitatorStageId = this.db.newMeeting.facilitatorStageId as string
    const mutations = this.db._botScript[facilitatorStageId]
    const nextMutaton = mutations.shift()
    if (!nextMutaton) {
      this.emit('botsFinished')
      return
    }
    const {delay, op, variables, botId} = nextMutaton
    this.pendingBotAction = () => {
      this.ops[op](variables, botId)
      return mutations
    }
    this.pendingBotTimeout = window.setTimeout(() => {
      this.pendingBotTimeout = undefined
      if (this.pendingBotAction) {
        this.pendingBotAction()
        this.pendingBotAction = undefined
      }
      this.startBot()
    }, delay)
  }

  isBotFinished = () => {
    return !this.pendingBotAction
  }

  finishBotActions = async () => {
    window.clearTimeout(this.pendingBotTimeout)
    this.pendingBotTimeout = undefined
    if (!this.pendingBotAction) return
    const mutationsToFlush = this.pendingBotAction()
    if (this.db.newMeeting.facilitatorStageId !== 'groupStage') {
      mutationsToFlush.forEach((mutation) => {
        this.ops[mutation.op](mutation.variables, mutation.botId)
      })
      mutationsToFlush.length = 0
      this.pendingBotAction = undefined
    } else {
      const mutationThunks = [] as Array<() => Promise<any>>
      mutationsToFlush.forEach((mutation) => {
        if (mutation.op === 'UpdateDragLocationMutation') return
        const thunk = () => this.ops[mutation.op](mutation.variables, mutation.botId)
        mutationThunks.push(thunk)
        if (mutation.op === 'EndDraggingReflectionMutation') {
          mutationThunks.push(async () => sleep(1010))
        }
      })
      for (const thunk of mutationThunks) {
        await thunk()
      }
    }
  }

  ops = {
    ExportToCSVQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          newMeeting: {
            ...this.db.newMeeting,
            reflectionGroups: this.db.newMeeting.reflectionGroups!.filter(
              (group) => group.voterIds.length > 0
            )
          }
        }
      }
    },
    TaskFooterIntegrateMenuRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          userOnTeam: {
            ...this.db.users[0]
          }
        }
      }
    },
    NewMeetingSummaryRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          newMeeting: {
            ...this.db.newMeeting,
            reflectionGroups: this.db.newMeeting.reflectionGroups!.filter(
              (group) => group.voterIds.length > 0
            ),
            meetingMembers: this.db.newMeeting.meetingMembers!.map((member) => ({
              ...member,
              tasks: member!.tasks.filter((task) => !task.tags!.includes('private'))
            }))
          }
        }
      }
    },
    TaskFooterUserAssigneeMenuRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          team: this.db.team
        }
      }
    },
    RetroRootQuery: () => {
      this.startBot()
      return {
        viewer: {
          ...this.db.users[0],
          team: this.db.team
        }
      }
    },
    SuggestMentionableUsersRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          team: {
            ...this.db.team,
            teamMembers: this.db.team.teamMembers.filter((member) => member.userId !== demoViewerId)
          }
        }
      }
    },
    useAllIntegrationsQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          userOnTeam: {
            ...this.db.users[0]
          }
        }
      }
    },
    CreateGitHubIssueMutation: ({taskId, nameWithOwner}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)
      // if the human deleted the task, exit fast
      if (!task) return null
      Object.assign(task, {
        updatedAt: new Date().toJSON(),
        integration: {
          __typename: 'TaskIntegrationGitHub',
          id: `${taskId}:GitHub`,
          ...GitHubProjectKeyLookup[nameWithOwner],
          issueNumber: this.getTempId('')
        }
      })

      const data = {
        __typename: 'CreateGitHubIssuePayload',
        error: null,
        task
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {createGitHubIssue: data}
    },
    CreateJiraIssueMutation: ({projectKey, taskId}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)
      // if the human deleted the task, exit fast
      if (!task) return null
      Object.assign(task, {
        updatedAt: new Date().toJSON(),
        integration: {
          __typename: 'TaskIntegrationJira',
          id: `${taskId}:jira`,
          ...JiraProjectKeyLookup[projectKey],
          issueKey: this.getTempId(`${projectKey}-`)
        }
      })

      const data = {
        __typename: 'CreateJiraIssuePayload',
        error: null,
        task
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {createJiraIssue: data}
    },
    CreateReflectionMutation: (
      {input: {content, retroPhaseItemId, sortOrder, id, groupId}},
      userId
    ) => {
      const now = new Date().toJSON()
      const reflectPhase = this.db.newMeeting.phases![1] as IReflectPhase
      const phaseItem = reflectPhase.reflectPrompts.find((prompt) => prompt.id === retroPhaseItemId)
      const reflectionGroupId = groupId || this.getTempId('refGroup')
      const reflectionId = id || this.getTempId('ref')
      const reflection = {
        __typename: 'RetroReflection',
        id: reflectionId,
        reflectionId,
        createdAt: now,
        creatorId: userId,
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
      } as Partial<IRetroReflection & {isHumanTouched: boolean}>

      const reflectionGroup = {
        __typename: 'RetroReflectionGroup',
        id: reflectionGroupId,
        reflectionGroupId,
        title: null,
        voteCount: 0,
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
      {phaseItemId, isEditing}: {phaseItemId: string; isEditing: boolean},
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
    NavigateMeetingMutation: async ({completedStageId, facilitatorStageId, meetingId}, userId) => {
      let phaseCompleteData
      let unlockedStageIds
      const meeting = this.db.newMeeting
      const {phases} = meeting
      let runBot = false
      if (completedStageId) {
        const completedStageRes = findStageById(phases, completedStageId)
        const {stage} = completedStageRes!
        if (!stage.isComplete) {
          runBot = true
          stage.isComplete = true
          stage.endAt = new Date().toJSON()
          phaseCompleteData = await handleCompletedDemoStage(this.db, stage)
          const groupData = phaseCompleteData[GROUP]
          if (groupData) {
            Object.assign(groupData, {
              meeting: this.db.newMeeting,
              reflectionGroups: groupData.reflectionGroupIds.map((id) =>
                this.db.reflectionGroups.find((group) => group.id === id)
              )
            })
          } else if (phaseCompleteData[VOTE]) {
            Object.assign(phaseCompleteData[VOTE], {
              meeting: this.db.newMeeting
            })
          }
        }
      }
      if (!phaseCompleteData || Object.keys(phaseCompleteData).length === 0) {
        phaseCompleteData = {[REFLECT]: null, [GROUP]: null, [VOTE]: null}
      }
      if (facilitatorStageId) {
        const facilitatorStageRes = findStageById(phases, facilitatorStageId)
        const {stage: facilitatorStage} = facilitatorStageRes!
        startStage_(facilitatorStage)

        // mutative! sets isNavigable and isNavigableByFacilitator
        unlockedStageIds = unlockNextStages(facilitatorStageId, phases, meetingId)
      }

      const oldFacilitatorStageId = this.db.newMeeting.facilitatorStageId!
      Object.assign(this.db.newMeeting, {
        facilitatorStageId,
        updatedAt: new Date().toJSON()
      })

      const data = {
        error: null,
        meetingId,
        meeting: this.db.newMeeting,
        oldFacilitatorStageId,
        oldFacilitatorStage: findStageById(phases, oldFacilitatorStageId)!.stage,
        facilitatorStageId,
        facilitatorStage: findStageById(phases, facilitatorStageId)!.stage,
        unlockedStageIds,
        unlockedStages: unlockedStageIds.map((stageId) => findStageById(phases, stageId)!.stage),
        phaseComplete: phaseCompleteData,
        __typename: 'NavigateMeetingMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      if (runBot) {
        this.startBot()
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
    StartDraggingReflectionMutation: ({reflectionId, initialCoords, dragId}, userId) => {
      let dragCoords = initialCoords
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      if (userId !== demoViewerId) {
        if (reflection.isHumanTouched) return
        const {itemCache} = (this.atmosphere as any).getMasonry()
        const cachedItem = itemCache[reflectionId]
        const bbox = (cachedItem.el as HTMLDivElement).getBoundingClientRect()
        dragCoords = {x: bbox.left, y: bbox.top}
      } else {
        reflection.isHumanTouched = true
      }
      const data = {
        error: null,
        teamId: demoTeamId,
        meetingId: demoMeetingId,
        reflectionId,
        reflection,
        dragContext: {
          id: dragId || this.getTempId('drag'),
          dragUserId: userId,
          dragUser: this.db.users.find((user) => user.id === userId),
          dragCoords
        },
        __typename: 'StartDraggingReflectionPayload'
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
      if (userId !== demoViewerId) {
        if (!reflection || reflection.isHumanTouched) return undefined
      }
      const {reflectionGroupId: oldReflectionGroupId} = reflection
      const oldReflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === oldReflectionGroupId
      )!
      const oldReflections = oldReflectionGroup.reflections!
      let failedDrop = false
      if (dropTargetType === DragReflectionDropTargetTypeEnum.REFLECTION_GRID) {
        const {retroPhaseItemId} = reflection
        newReflectionGroupId = this.getTempId('group')
        const newReflectionGroup = {
          __typename: 'RetroReflectionGroup',
          id: newReflectionGroupId,
          reflectionGroupId: newReflectionGroupId,
          title: null,
          voteCount: 0,
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
        const reflectionGroup = this.db.reflectionGroups.find((group) => group.id === dropTargetId)!
        if (reflectionGroup) {
          newReflectionGroupId = dropTargetId
          const sortOrders = this.db.reflections
            .filter((r) => r.reflectionGroupId === newReflectionGroupId)
            .map((r) => (r && r.sortOrder) || 0)
          const maxSortOrder = Math.max(...sortOrders)
          Object.assign(reflection, {
            sortOrder: maxSortOrder + 1 + dndNoise(),
            reflectionGroupId: newReflectionGroupId,
            retroReflectionGroup: reflectionGroup as any,
            updatedAt: now
          })
          reflectionGroup.reflections!.push(reflection as any)
          oldReflections.splice(
            oldReflections.findIndex((reflection) => reflection === reflection),
            1
          )
          if (oldReflectionGroupId !== newReflectionGroupId) {
            const nextReflections = this.db.reflections.filter(
              (reflection) => reflection.reflectionGroupId === newReflectionGroupId
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
        } else {
          failedDrop = true
        }
      }
      const data = {
        __typename: 'EndDraggingReflectionPayload',
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
        userId,
        dropTargetType: failedDrop ? null : dropTargetType,
        dropTargetId: failedDrop ? null : dropTargetId,
        dragId
      }

      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {endDraggingReflection: data}
    },
    UpdateDragLocationMutation: ({input}, userId) => {
      const {teamId, ...inputData} = input
      const data = {...inputData, userId, __typename: 'UpdateDragLocationPayload'}
      if (userId !== demoViewerId) {
        const {sourceId} = inputData
        const reflection = this.db.reflections.find((reflection) => reflection.id === sourceId)
        if (!reflection || reflection.isHumanTouched) return undefined
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
    UpdateReflectionGroupTitleMutation: ({reflectionGroupId, title}, userId) => {
      const reflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === reflectionGroupId
      )!
      const now = new Date().toJSON()
      Object.assign(reflectionGroup, {
        title,
        titleIsUsedDefined: true,
        updatedAt: now
      })
      const data = {
        __typename: 'UpdateReflectionGroupTitleMutation',
        error: null,
        meeting: this.db.newMeeting,
        meetingId: demoMeetingId,
        reflectionGroupId,
        reflectionGroup
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {updateReflectionGroupTitle: data}
    },
    VoteForReflectionGroupMutation: ({isUnvote, reflectionGroupId}, userId) => {
      const reflectionGroup =
        this.db.reflectionGroups.find((group) => group.id === reflectionGroupId) ||
        this.db.reflectionGroups.find((group) => Boolean(group.isActive))!
      const meetingMember = this.db.meetingMembers.find((member) => member.userId === userId)!
      const voterIds = reflectionGroup.voterIds!
      const now = new Date().toJSON()
      if (isUnvote) {
        const idx = voterIds.indexOf(userId)
        if (idx === -1) {
          return {error: {message: 'no votes'}}
        }
        voterIds.splice(idx, 1)
        Object.assign(meetingMember, {
          votesRemaining: meetingMember.votesRemaining + 1,
          updatedAt: now
        })
        Object.assign(this.db.newMeeting, {
          votesRemaining: this.db.newMeeting.votesRemaining! + 1,
          teamVotesRemaining: this.db.newMeeting.votesRemaining! + 1
        })
      } else {
        voterIds.push(userId)
        Object.assign(meetingMember, {
          votesRemaining: meetingMember.votesRemaining - 1,
          updatedAt: now
        })
        Object.assign(this.db.newMeeting, {
          votesRemaining: this.db.newMeeting.votesRemaining! - 1,
          teamVotesRemaining: this.db.newMeeting.votesRemaining! - 1
        })
      }
      reflectionGroup.voteCount = voterIds.length
      reflectionGroup.viewerVoteCount = voterIds.filter((id) => id === demoViewerId).length
      const voteCount = this.db.reflectionGroups.reduce(
        (sum, group) => sum + group.voterIds!.length,
        0
      )

      let isUnlock
      let unlockedStageIds
      if (voteCount === 0) {
        isUnlock = false
      } else if (voteCount === 1 && !isUnvote) {
        isUnlock = true
      }
      const phases = this.db.newMeeting.phases as any
      if (isUnlock !== undefined) {
        unlockedStageIds = unlockAllStagesForPhase(phases, DISCUSS, true, isUnlock)
      }

      const data = {
        __typename: 'VoteForReflectionGroupPayload',
        error: null,
        meeting: this.db.newMeeting,
        meetingId: demoMeetingId,
        meetingMember,
        userId,
        reflectionGroupId: reflectionGroup.id,
        reflectionGroup,
        unlockedStageIds,
        unlockedStages: unlockedStageIds
          ? unlockedStageIds.map((stageId) => findStageById(phases, stageId)!.stage)
          : []
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {voteForReflectionGroup: data}
    },
    CreateTaskMutation: ({newTask}, userId) => {
      const now = new Date().toJSON()
      const teamMemberId = toTeamMemberId(demoTeamId, userId)
      const taskId = newTask.id || this.getTempId('task')
      const {reflectionGroupId, sortOrder, status} = newTask
      const content = newTask.content || makeEmptyStr()
      const {entityMap} = JSON.parse(content)
      const tags = getTagsFromEntityMap(entityMap)
      const task = {
        __typename: 'Task',
        id: taskId,
        taskId,
        agendaId: null,
        content,
        createdAt: now,
        createdBy: userId,
        dueDate: null,
        editors: [],
        integration: null,
        team: this.db.team,
        isSoftTask: false,
        meetingId: demoMeetingId,
        reflectionGroupId,
        sortOrder: sortOrder || 0,
        status,
        taskStatus: status,
        tags,
        teamId: demoTeamId,
        assigneeId: teamMemberId,
        assignee: this.db.teamMembers.find((teamMember) => teamMember.id === teamMemberId),
        updatedAt: now,
        userId
      }
      this.db.tasks.push(task as any)
      const reflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === reflectionGroupId
      )!
      const meetingMember = this.db.meetingMembers.find((member) => member.userId === userId)!
      meetingMember.tasks.push(task as any)
      reflectionGroup.tasks!.push(task as any)
      const data = {
        __typename: 'CreateTaskPayload',
        error: null,
        task,
        involvementNotification: null
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {createTask: data}
    },
    EditTaskMutation: ({taskId, isEditing}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)!
      const data = {
        __typename: 'EditTaskMutation',
        error: null,
        task,
        editor: this.db.users.find((user) => user.id === userId),
        isEditing
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {editTask: data}
    },
    UpdateTaskMutation: ({updatedTask}, userId) => {
      const {agendaId, content, status, assigneeId, sortOrder} = updatedTask
      const taskUpdates = {
        agendaId,
        content,
        status,
        tags: content ? getTagsFromEntityMap(JSON.parse(content).entityMap) : undefined,
        teamId: demoTeamId,
        assigneeId,
        sortOrder,
        isSoftTask: false,
        userId: null
      }
      const task = this.db.tasks.find((task) => task.id === updatedTask.id)
      // if the human deleted the task, exit fast
      if (!task) return null
      if (assigneeId) {
        const isSoftTask = getIsSoftTeamMember(assigneeId)
        taskUpdates.isSoftTask = isSoftTask
        taskUpdates.userId = isSoftTask ? null : fromTeamMemberId(assigneeId).userId
        if (assigneeId === false) {
          taskUpdates.userId = null
        }
        const oldMeetingMember = this.db.meetingMembers.find(
          (member) => member.userId === task.userId
        )!
        oldMeetingMember.tasks.splice(oldMeetingMember.tasks.indexOf(task as any), 1)
        const newMeetingMember = this.db.meetingMembers.find(
          (member) => member.userId === taskUpdates.userId
        )
        if (newMeetingMember) {
          newMeetingMember.tasks.push(task as any)
        }
      }
      Object.assign(task, {
        agendaId: taskUpdates.agendaId || task.agendaId,
        content: taskUpdates.content || task.content,
        status: taskUpdates.status || task.status,
        tags: taskUpdates.tags || task.tags,
        teamId: taskUpdates.teamId || task.teamId,
        assigneeId: taskUpdates.assigneeId || task.assigneeId,
        assignee: taskUpdates.assigneeId
          ? this.db.teamMembers.find((teamMember) => teamMember.id === taskUpdates.assigneeId)
          : task.assignee,
        sortOrder: taskUpdates.sortOrder || task.sortOrder,
        userId: taskUpdates.userId || task.userId
      })

      const data = {
        __typename: 'UpdateTaskPayload',
        error: null,
        task,
        privatizedTaskId: null,
        addedNotification: null,
        removedNotification: null
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {updateTask: data}
    },
    DeleteTaskMutation: ({taskId}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)!
      const {reflectionGroupId} = task
      const reflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === reflectionGroupId
      )!
      reflectionGroup.tasks!.splice(reflectionGroup.tasks!.indexOf(task as any), 1)
      const data = {error: null, task, involvementNotification: null}
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {deleteTask: data}
    },
    UpdateTaskDueDateMutation: ({taskId, dueDate}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)!
      task.dueDate = dueDate

      const data = {__typename: 'UpdateTaskDueDatePayload', error: null, task}
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {updateTaskDueDate: data}
    },
    DragDiscussionTopicMutation: ({stageId, sortOrder}, userId) => {
      const discussPhase = this.db.newMeeting.phases!.find(
        (phase) => phase.phaseType === DISCUSS
      ) as IDiscussPhase
      const {stages} = discussPhase
      const draggedStage = stages.find((stage) => stage.id === stageId)!
      draggedStage.sortOrder = sortOrder
      stages.sort((a, b) => {
        return a.sortOrder > b.sortOrder ? 1 : -1
      })
      const data = {
        meeting: this.db.newMeeting,
        error: null,
        stage: draggedStage
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {dragDiscussionTopic: data}
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
        __typename: 'EndNewMeetingPayload'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {endNewMeeting: data}
    },
    InviteToTeamMutation: ({invitees}) => {
      return {inviteToTeam: {invitees}}
    }
  }

  fetch = async (opName: string, variables: Variables) => {
    const resolve = this.ops[opName]
    if (!resolve) {
      console.error('op not found', opName)
      return {
        errors: [{message: `op not found ${opName}`}]
      }
    }
    return {
      data: await resolve(variables, demoViewerId)
    }
  }
}

export default ClientGraphQLServer

import EventEmitter from 'eventemitter3'
import {parse} from 'flatted'
import ms from 'ms'
import Reflection from 'parabol-server/database/types/Reflection'
import {Variables} from 'relay-runtime'
import StrictEventEmitter from 'strict-event-emitter-types'
import stringSimilarity from 'string-similarity'
import {RetroDemo, SubscriptionChannel} from '../../types/constEnums'
import {
  DragReflectionDropTargetTypeEnum,
  IDiscussPhase,
  IGoogleAnalyzedEntity,
  INewMeetingStage,
  IReflectPhase,
  IRetroReflection,
  IRetroReflectionGroup,
  ITask,
  NewMeetingPhase,
  NewMeetingPhaseTypeEnum
} from '../../types/graphql'
import getGroupSmartTitle from '../../utils/autogroup/getGroupSmartTitle'
import groupReflections from '../../utils/autogroup/groupReflections'
import {DISCUSS, GROUP, REFLECT, TASK, TEAM, VOTE} from '../../utils/constants'
import dndNoise from '../../utils/dndNoise'
import extractTextFromDraftString from '../../utils/draftjs/extractTextFromDraftString'
import getTagsFromEntityMap from '../../utils/draftjs/getTagsFromEntityMap'
import makeEmptyStr from '../../utils/draftjs/makeEmptyStr'
import findStageById from '../../utils/meetings/findStageById'
import fromTeamMemberId from '../../utils/relay/fromTeamMemberId'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import sleep from '../../utils/sleep'
import startStage_ from '../../utils/startStage_'
import unlockAllStagesForPhase from '../../utils/unlockAllStagesForPhase'
import unlockNextStages from '../../utils/unlockNextStages'
import normalizeRawDraftJS from '../../validation/normalizeRawDraftJS'
import entityLookup from './entityLookup'
import getDemoEntities from './getDemoEntities'
import handleCompletedDemoStage from './handleCompletedDemoStage'
import initBotScript from './initBotScript'
import initDB, {
  demoTeamId,
  demoViewerId,
  GitHubProjectKeyLookup,
  JiraProjectKeyLookup
} from './initDB'
import LocalAtmosphere from './LocalAtmosphere'

export type DemoReflection = Omit<
  IRetroReflection,
  'autoReflectionGroupId' | 'team' | 'reactjis'
> & {
  creatorId: string
  reactjis: any[]
  reflectionId: string
  isHumanTouched: boolean
}

export type DemoReflectionGroup = Omit<IRetroReflectionGroup, 'team' | 'reflections'> & {
  reflectionGroupId: string
  reflections: DemoReflection[]
}

export type DemoTask = Omit<ITask, 'agendaItem'>

interface Payload {
  __typename: string

  [key: string]: any
}

interface DemoEvents {
  task: Payload
  team: Payload
  meeting: Payload
  botsFinished: void
  startDemo: void
}

interface GQLDemoEmitter {
  new (): StrictEventEmitter<EventEmitter, DemoEvents>
}

class ClientGraphQLServer extends (EventEmitter as GQLDemoEmitter) {
  atmosphere: LocalAtmosphere
  db: ReturnType<typeof initDB>
  getTempId = (prefix) => `${prefix}${this.db._tempID++}`
  pendingBotTimeout: number | undefined
  pendingBotAction?: (() => any[]) | undefined
  isNew = true
  constructor(atmosphere: LocalAtmosphere) {
    super()
    this.atmosphere = atmosphere
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
    if (!isStale) {
      this.isNew = false
    }
  }

  getUnlockedStages(stageIds: string[]) {
    const unlockedStages = [] as INewMeetingStage[]
    this.db.newMeeting.phases!.forEach((phase) => {
      ;(phase.stages as any).forEach((stage) => {
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
              tasks: member.tasks.filter((task) => !task.tags.includes('private'))
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
    DemoMeetingRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          meeting: this.db.newMeeting
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
    AddReactjiToReflectionMutation: ({reflectionId, isRemove, reactji}, userId) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)
      if (!reflection) return null
      const reactjiId = `${reflectionId}:${reactji}`
      const {reactjis} = reflection
      const existingReactjiIdx = reactjis.findIndex((agg) => agg.id === reactjiId)
      const existingReactji = reactjis[existingReactjiIdx]
      if (isRemove) {
        if (!existingReactji) return null
        if (existingReactji.count === 1) {
          reactjis.splice(existingReactjiIdx, 1)
        } else {
          existingReactji.count--
          existingReactji.isViewerReactji = false
        }
      } else {
        if (!existingReactji) {
          reactjis.push({id: reactjiId, count: 1, isViewerReactji: userId === demoViewerId})
        } else {
          existingReactji.count++
          existingReactji.isViewerReactji =
            existingReactji.isViewerReactji || userId === demoViewerId
        }
      }
      const data = {
        __typename: 'AddReactjiToReflectionSuccess',
        reflection
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {addReactjiToReflection: data}
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
    CreateReflectionMutation: async (
      {input: {content, retroPhaseItemId, sortOrder, id, groupId}},
      userId: string
    ) => {
      const now = new Date().toJSON()
      const reflectPhase = this.db.newMeeting.phases![1] as IReflectPhase
      const phaseItem = reflectPhase.reflectPrompts.find((prompt) => prompt.id === retroPhaseItemId)
      const reflectionGroupId = groupId || this.getTempId('refGroup')
      const reflectionId = id || this.getTempId('ref')
      const normalizedContent = normalizeRawDraftJS(content)
      const plaintextContent = extractTextFromDraftString(normalizedContent)
      let entities = [] as IGoogleAnalyzedEntity[]
      if (userId !== demoViewerId) {
        entities = entityLookup[reflectionId].entities
      } else {
        entities = (await getDemoEntities(plaintextContent)) as any
      }

      const reflection = {
        __typename: 'RetroReflection',
        id: reflectionId,
        isHumanTouched: false,
        reflectionId,
        createdAt: now,
        creatorId: userId,
        content: normalizedContent,
        plaintextContent,
        dragContext: null,
        editorIds: [],
        isActive: true,
        isEditing: null,
        isViewerCreator: userId === demoViewerId,
        entities,
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        phaseItem,
        reactjis: [] as any[],
        reflectionGroupId,
        retroPhaseItemId,
        sortOrder: 0,
        updatedAt: now,
        retroReflectionGroup: undefined as any
      } as DemoReflection

      const smartTitle = getGroupSmartTitle([reflection])

      const reflectionGroup = {
        __typename: 'RetroReflectionGroup',
        id: reflectionGroupId,
        reflectionGroupId,
        smartTitle,
        title: smartTitle,
        voteCount: 0,
        viewerVoteCount: 0,
        createdAt: now,
        isActive: true,
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        phaseItem,
        retroPhaseItemId,
        reflections: [reflection],
        sortOrder,
        tasks: [],
        titleIsUserDefined: false,
        updatedAt: now,
        voterIds: []
      } as DemoReflectionGroup

      reflection.retroReflectionGroup = reflectionGroup as any
      this.db.reflectionGroups.push(reflectionGroup)
      this.db.reflections.push(reflection)
      const unlockedStageIds = unlockAllStagesForPhase(
        this.db.newMeeting.phases as any,
        NewMeetingPhaseTypeEnum.group,
        true
      )
      const unlockedStages = this.getUnlockedStages(unlockedStageIds)
      const data = {
        meetingId: RetroDemo.MEETING_ID,
        reflection,
        reflectionId: reflection.id,
        reflectionGroupId,
        reflectionGroup,
        unlockedStageIds,
        unlockedStages,
        __typename: 'CreateReflectionPayload'
      }

      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
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
        this.emit(SubscriptionChannel.MEETING, data)
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
        ? unlockAllStagesForPhase(
            this.db.newMeeting.phases as any,
            NewMeetingPhaseTypeEnum.group,
            true,
            false
          )
        : []
      const unlockedStages = this.getUnlockedStages(unlockedStageIds)
      const data = {
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        reflectionId,
        reflection,
        unlockedStages,
        unlockedStageIds,
        __typename: 'RemoveReflectionMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {removeReflection: data}
    },
    UpdateReflectionContentMutation: async ({reflectionId, content}, userId) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      reflection.content = content
      reflection.updatedAt = new Date().toJSON()
      const plaintextContent = extractTextFromDraftString(content)
      const isVeryDifferent =
        stringSimilarity.compareTwoStrings(plaintextContent, reflection.plaintextContent) < 0.9
      const entities = isVeryDifferent
        ? await getDemoEntities(plaintextContent)
        : reflection.entities
      reflection.plaintextContent = plaintextContent
      reflection.entities = entities as any

      const reflectionsInGroup = this.db.reflections.filter(
        ({reflectionGroupId}) => reflectionGroupId === reflection.reflectionGroupId
      )
      const newTitle = getGroupSmartTitle(reflectionsInGroup)
      const reflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === reflection.reflectionGroupId
      )
      if (reflectionGroup) {
        const titleIsUserDefined = reflectionGroup.smartTitle !== reflectionGroup.title
        reflectionGroup.smartTitle = newTitle
        if (!titleIsUserDefined) {
          reflectionGroup.title = newTitle
        }
      }
      const data = {
        error: null,
        meeting: this.db.newMeeting,
        reflection,
        __typename: 'UpdateReflectionContentMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
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
              meeting: this.db.newMeeting
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
        this.emit(SubscriptionChannel.MEETING, data)
      }
      if (runBot) {
        this.startBot()
      }
      return {navigateMeeting: data}
    },
    RenameMeetingMutation: ({name}, userId) => {
      const meeting = this.db.newMeeting
      meeting.name = name
      const data = {
        __typename: 'RenameMeetingSuccess',
        meeting
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {renameMeeting: data}
    },
    SetPhaseFocusMutation: ({focusedPhaseItemId}, userId) => {
      const reflectPhase = this.db.newMeeting.phases!.find(
        (phase) => phase.phaseType === REFLECT
      ) as IReflectPhase
      reflectPhase.focusedPhaseItemId = focusedPhaseItemId || null
      const data = {
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        reflectPhase,
        __typename: 'SetPhaseFocusMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {setPhaseFocus: data}
    },
    SetSlackNotificationMutation: ({slackChannelId, slackNotificationEvents}, userId) => {
      const teamMember = this.db.teamMembers.find((teamMember) => teamMember.userId === userId)!
      const {slackNotifications} = teamMember
      const filteredNotifications = slackNotifications.filter((notification) =>
        slackNotificationEvents.includes(notification.event)
      )
      filteredNotifications.forEach((notification) => {
        notification.channelId = slackChannelId
      })
      const slackNotificationIds = filteredNotifications.map(({id}) => id)
      const data = {
        __typename: 'SetSlackNotificationMutation',
        error: null,
        userId,
        user: this.db.users.find((user) => user.id === userId),
        slackNotificationIds
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {setSlackNotification: data}
    },
    SetStageTimerMutation: ({scheduledEndTime: newScheduledEndTime, timeRemaining}, userId) => {
      const {phases, facilitatorStageId} = this.db.newMeeting
      const stageRes = findStageById(phases, facilitatorStageId!)
      const {stage} = stageRes!

      if (newScheduledEndTime) {
        stage.scheduledEndTime = newScheduledEndTime
        stage.isAsync = !timeRemaining
        stage.timeRemaining = newScheduledEndTime - Date.now()
      } else {
        stage.isAsync = null
        stage.scheduledEndTime = null
        stage.timeRemaining = null
      }
      const data = {
        __typename: 'SetStageTimerMutation',
        error: null,
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        stageId: facilitatorStageId,
        stage
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {setStageTimer: data}
    },
    StartDraggingReflectionMutation: ({reflectionId, dragId}, userId) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      if (!reflection) return
      if (userId !== demoViewerId) {
        if (reflection.isHumanTouched) return
      } else {
        reflection.isHumanTouched = true
      }
      const user = this.db.users.find((user) => user.id === userId)
      const data = {
        error: null,
        teamId: demoTeamId,
        meetingId: RetroDemo.MEETING_ID,
        reflectionId,
        reflection,
        remoteDrag: {
          id: dragId,
          dragUserId: userId,
          dragUserName: user ? user.preferredName : 'A Ghost'
        },
        __typename: 'StartDraggingReflectionPayload'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
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
          meetingId: RetroDemo.MEETING_ID,
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
        const nextTitle = getGroupSmartTitle([reflection as Reflection])
        newReflectionGroup.smartTitle = nextTitle
        newReflectionGroup.title = nextTitle
        if (oldReflections.length > 0) {
          const oldTitle = getGroupSmartTitle(oldReflections)
          const titleIsUserDefined = oldReflectionGroup.smartTitle !== oldReflectionGroup.title
          oldReflectionGroup.smartTitle = oldTitle
          if (!titleIsUserDefined) {
            oldReflectionGroup.title = oldTitle
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
          reflectionGroup.reflections.sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
          oldReflections.splice(
            oldReflections.findIndex((reflection) => reflection === reflection),
            1
          )
          if (oldReflectionGroupId !== newReflectionGroupId) {
            const reflections = this.db.reflections
            const nextReflections = reflections.filter(
              (reflection) => reflection.reflectionGroupId === newReflectionGroupId
            )
            const oldReflections = reflections.filter(
              (reflection) => reflection.reflectionGroupId === oldReflectionGroupId
            )
            const nextTitle = getGroupSmartTitle(nextReflections)
            const titleIsUserDefined = reflectionGroup.smartTitle !== reflectionGroup.title
            reflectionGroup.smartTitle = nextTitle
            if (!titleIsUserDefined) {
              reflectionGroup.title = nextTitle
            }
            const oldReflectionGroup = this.db.reflectionGroups.find(
              (group) => group.id === oldReflectionGroupId
            )!
            if (oldReflections.length > 0) {
              const oldTitle = getGroupSmartTitle(oldReflections)
              const titleIsUserDefined = oldReflectionGroup.smartTitle !== oldReflectionGroup.title
              oldReflectionGroup.smartTitle = oldTitle
              if (!titleIsUserDefined) {
                oldReflectionGroup.title = oldTitle
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
      const user = this.db.users.find((user) => user.id === userId)
      const data = {
        __typename: 'EndDraggingReflectionPayload',
        meetingId: RetroDemo.MEETING_ID,
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
        remoteDrag: {
          id: dragId,
          dragUserId: userId,
          dragUserName: user ? user.preferredName : 'A Ghost'
        }
      }

      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {endDraggingReflection: data}
    },
    UpdateDragLocationMutation: ({input}, userId) => {
      const {teamId, ...inputData} = input
      const data = {
        drag: inputData,
        remoteDrag: inputData,
        userId,
        __typename: 'UpdateDragLocationPayload'
      }
      if (userId !== demoViewerId) {
        const {sourceId} = inputData
        const reflection = this.db.reflections.find((reflection) => reflection.id === sourceId)
        if (!reflection || reflection.isHumanTouched) return undefined
        this.emit(SubscriptionChannel.MEETING, data)
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
      } = groupReflections(reflections as any, groupingThreshold)
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
          removedReflectionGroupIds.includes(group.id as string)
        ),
        reflectionGroupIds,
        reflectionIds,
        removedReflectionGroupIds,
        __typename: 'AutoGroupReflectionsMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
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
        titleIsUserDefined: true,
        updatedAt: now
      })
      const data = {
        __typename: 'UpdateReflectionGroupTitleMutation',
        error: null,
        meeting: this.db.newMeeting,
        meetingId: RetroDemo.MEETING_ID,
        reflectionGroupId,
        reflectionGroup
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
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
        unlockedStageIds = unlockAllStagesForPhase(
          phases,
          NewMeetingPhaseTypeEnum.discuss,
          true,
          isUnlock
        )
      }

      const data = {
        __typename: 'VoteForReflectionGroupPayload',
        error: null,
        meeting: this.db.newMeeting,
        meetingId: RetroDemo.MEETING_ID,
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
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {voteForReflectionGroup: data}
    },
    CreateTaskMutation: async ({newTask}, userId) => {
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
        meetingId: RetroDemo.MEETING_ID,
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
      // a strange error occurs without sleep.
      // To reproduce, get to the discuss phase & quickly add a task before the bots do
      // the result is tasks == [undefined]
      // if a sleep is added, RetroDiscussPhase component is notified, but without, only MeetingAgendaCards is notified
      // honestly, no good idea what is going on here. don't even know if it's relay or react (or me)
      await sleep(100)
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
        userId: null as null | string
      }
      const task = this.db.tasks.find((task) => task.id === updatedTask.id)
      // if the human deleted the task, exit fast
      if (!task) return null
      if (assigneeId) {
        taskUpdates.userId = fromTeamMemberId(assigneeId).userId
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
        addedNotification: null
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
      const data = {
        __typename: 'DeleteTaskPayload',
        error: null,
        task,
        involvementNotification: null
      }
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
        __typename: 'DragDiscussionTopicPayload',
        meeting: this.db.newMeeting,
        error: null,
        stage: draggedStage
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {dragDiscussionTopic: data}
    },
    EndNewMeetingMutation: ({meetingId}, userId) => {
      const phases = this.db.newMeeting.phases as NewMeetingPhase[]
      const lastPhase = phases[phases.length - 1] as IDiscussPhase
      const currentStage = lastPhase.stages.find((stage) => stage.startAt && !stage.endAt)
      const now = new Date().toJSON()
      if (currentStage) {
        currentStage.isComplete = true
        currentStage.endAt = now
      }

      this.db.newMeeting.endedAt = now

      const data = {
        error: null,
        meeting: this.db.newMeeting,
        meetingId,
        team: this.db.team,
        teamId: demoTeamId,
        isKill: !currentStage,
        removedTaskIds: [],
        removedSuggestedActionId: null,
        updatedTasks: this.db.tasks,
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

import {generateText} from '@tiptap/core'
import type {OperationType} from 'relay-runtime'
import type {AddCommentMutation} from '~/__generated__/AddCommentMutation.graphql'
import type {AddReactjiToReactableMutation} from '~/__generated__/AddReactjiToReactableMutation.graphql'
import type {CreateTaskMutation} from '~/__generated__/CreateTaskMutation.graphql'
import type {DeleteCommentMutation} from '~/__generated__/DeleteCommentMutation.graphql'
import type {DeleteTaskMutation} from '~/__generated__/DeleteTaskMutation.graphql'
import type {EditCommentingMutation} from '~/__generated__/EditCommentingMutation.graphql'
import type {EditTaskMutation} from '~/__generated__/EditTaskMutation.graphql'
import type {SetTaskHighlightMutation} from '~/__generated__/SetTaskHighlightMutation.graphql'
import type {TaskFooterIntegrateMenuQuery} from '~/__generated__/TaskFooterIntegrateMenuQuery.graphql'
import type {TaskFooterUserAssigneeMenuQuery} from '~/__generated__/TaskFooterUserAssigneeMenuQuery.graphql'
import type {tiptapMentionConfigQuery} from '~/__generated__/tiptapMentionConfigQuery.graphql'
import type {UpdateCommentContentMutation} from '~/__generated__/UpdateCommentContentMutation.graphql'
import type {UpdateTaskDueDateMutation} from '~/__generated__/UpdateTaskDueDateMutation.graphql'
import type {UpdateTaskMutation} from '~/__generated__/UpdateTaskMutation.graphql'
import type {useDragTeamHealthResultStageMutation} from '~/__generated__/useDragTeamHealthResultStageMutation.graphql'
import ReactjiId from '../../shared/gqlIds/ReactjiId'
import {getTagsFromTipTapTask} from '../../shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from '../../shared/tiptap/serverTipTapExtensions'
import {
  type DemoComment,
  type DemoDiscussion,
  type DemoReactji,
  type DemoReply,
  type DemoTask,
  type DemoThreadable,
  isDemoComment,
  isDemoMeeting,
  isDemoReply,
  isDemoResultStage,
  isDemoTask,
  type TeamHealthDemoMeetingResponse,
  type TeamHealthDemoThreadResponse
} from './teamHealthDemoFixtureTypes'
import {createTeamHealthDemoMeetingResponse} from './teamHealthDemoMeetingFixture'
import {createDemoTask, demoTeamMemberId, toTaskContent} from './teamHealthDemoTaskFixture'
import {demoTeammates, demoViewer} from './teamHealthDemoTeammates'
import {createTeamHealthDemoThreadResponse} from './teamHealthDemoThreadFixture'

type Resolver<T extends OperationType> = (variables: T['variables']) => T['rawResponse']

const notFound = (message: string) => ({__typename: 'ErrorPayload' as const, error: {message}})

type CommentUpdate = <T extends DemoComment | DemoReply>(comment: T) => T

const mapComment = (node: DemoThreadable, commentId: string, update: CommentUpdate) => {
  if (!isDemoComment(node)) return node
  if (node.id === commentId) return update(node)
  return {
    ...node,
    replies: node.replies.map((reply) =>
      isDemoReply(reply) && reply.id === commentId ? update(reply) : reply
    )
  }
}

const findComment = (discussion: DemoDiscussion, commentId: string) => {
  for (const {node} of discussion.thread.edges) {
    if (!isDemoComment(node)) continue
    if (node.id === commentId) return {parent: node, comment: node}
    const reply = node.replies.find((reply) => isDemoReply(reply) && reply.id === commentId)
    if (reply && isDemoReply(reply)) return {parent: node, comment: reply}
  }
  return null
}

// the in-memory state behind the Team Health demo: the fixture, plus whatever the visitor adds to
// its threads during their visit. Nothing here outlives the page
export default class TeamHealthDemoDb {
  meeting: TeamHealthDemoMeetingResponse = createTeamHealthDemoMeetingResponse()
  private threads = new Map<string, TeamHealthDemoThreadResponse>()
  private commentCount = 0
  private taskCount = 0

  getThread(discussionId: string) {
    const cached = this.threads.get(discussionId)
    if (cached) return cached
    const thread = createTeamHealthDemoThreadResponse(discussionId)
    this.threads.set(discussionId, thread)
    return thread
  }

  private findComment(commentId: string) {
    for (const {viewer} of this.threads.values()) {
      const found = viewer.discussion && findComment(viewer.discussion, commentId)
      if (found) return {discussion: viewer.discussion!, ...found}
    }
    return null
  }

  private setDiscussion(discussion: DemoDiscussion) {
    const thread = this.threads.get(discussion.id)!
    this.threads.set(discussion.id, {...thread, viewer: {...thread.viewer, discussion}})
  }

  private updateComment(commentId: string, update: CommentUpdate) {
    const found = this.findComment(commentId)
    if (!found) return null
    const {discussion} = found
    const edges = discussion.thread.edges.map((edge) => ({
      ...edge,
      node: mapComment(edge.node, commentId, update)
    }))
    this.setDiscussion({...discussion, thread: {...discussion.thread, edges}})
    return this.findComment(commentId)
  }

  addComment: Resolver<AddCommentMutation> = ({comment: input}) => {
    const {content, discussionId, isAnonymous, threadParentId, threadSortOrder} = input
    const discussion = this.getThread(discussionId).viewer.discussion
    if (!discussion) return {addComment: notFound('Discussion not found')}
    const id = `teamHealthDemoVisitorComment_${this.commentCount++}`
    const now = new Date().toJSON()
    const author = isAnonymous
      ? null
      : {id: demoViewer.id, picture: demoViewer.picture, preferredName: demoViewer.preferredName}
    const reply: DemoReply = {
      __typename: 'Comment',
      __isThreadable: 'Comment',
      id,
      content,
      createdByUserNullable: author,
      isActive: true,
      isViewerComment: true,
      reactjis: [],
      threadSortOrder,
      updatedAt: now
    }
    const comment: DemoComment = {
      ...reply,
      discussionId,
      replies: [],
      threadParentId: threadParentId ?? null
    }
    const edges = threadParentId
      ? discussion.thread.edges.map((edge) =>
          isDemoComment(edge.node) && edge.node.id === threadParentId
            ? {...edge, node: {...edge.node, replies: [...edge.node.replies, reply]}}
            : edge
        )
      : [...discussion.thread.edges, {cursor: id, node: comment}]
    this.setDiscussion({...discussion, thread: {...discussion.thread, edges}})
    return {
      addComment: {
        __typename: 'AddCommentSuccess',
        meetingId: this.meeting.viewer.meeting?.id ?? null,
        comment
      }
    }
  }

  addReactji: Resolver<AddReactjiToReactableMutation> = ({reactableId, reactji, isRemove}) => {
    const reactjiId = ReactjiId.join(reactableId, reactji)
    const viewer = {id: demoViewer.id, preferredName: demoViewer.preferredName}
    const found = this.updateComment(reactableId, (comment) => {
      const existing = comment.reactjis.find(({id}) => id === reactjiId)
      let reactjis: DemoReactji[]
      if (isRemove) {
        reactjis = comment.reactjis
          .map((agg) =>
            agg.id !== reactjiId
              ? agg
              : {
                  ...agg,
                  count: agg.count - 1,
                  isViewerReactji: false,
                  users: agg.users.filter(({id}) => id !== viewer.id)
                }
          )
          .filter(({count}) => count > 0)
      } else if (existing) {
        reactjis = comment.reactjis.map((agg) =>
          agg.id !== reactjiId || agg.isViewerReactji
            ? agg
            : {...agg, count: agg.count + 1, isViewerReactji: true, users: [...agg.users, viewer]}
        )
      } else {
        reactjis = [
          ...comment.reactjis,
          {id: reactjiId, count: 1, isViewerReactji: true, users: [viewer]}
        ]
      }
      return {...comment, reactjis}
    })
    if (!found) return {addReactjiToReactable: notFound('Comment not found')}
    const {comment: reactable} = found
    return {
      addReactjiToReactable: {
        __typename: 'AddReactjiToReactableSuccess',
        reactable: {__typename: 'Comment', id: reactable.id, reactjis: reactable.reactjis}
      }
    }
  }

  updateCommentContent: Resolver<UpdateCommentContentMutation> = ({commentId, content}) => {
    const updatedAt = new Date().toJSON()
    const found = this.updateComment(commentId, (comment) => ({...comment, content, updatedAt}))
    if (!found) return {updateCommentContent: notFound('Comment not found')}
    return {
      updateCommentContent: {
        __typename: 'UpdateCommentContentSuccess',
        comment: {id: commentId, content, updatedAt}
      }
    }
  }

  deleteComment: Resolver<DeleteCommentMutation> = ({commentId}) => {
    const found = this.updateComment(commentId, (comment) => ({
      ...comment,
      isActive: false,
      updatedAt: new Date().toJSON()
    }))
    if (!found) return {deleteComment: notFound('Comment not found')}
    const {discussion, parent, comment} = found
    return {
      deleteComment: {
        __typename: 'DeleteCommentSuccess',
        comment: {
          id: commentId,
          isActive: false,
          content: comment.content,
          discussionId: discussion.id,
          threadParentId: parent.id === commentId ? null : parent.id
        }
      }
    }
  }

  // commentors is the live "is typing" list, which the viewer is always filtered out of
  editCommenting: Resolver<EditCommentingMutation> = ({discussionId}) => {
    const discussion = this.getThread(discussionId).viewer.discussion
    if (!discussion) return {editCommenting: notFound('Discussion not found')}
    return {
      editCommenting: {
        __typename: 'EditCommentingSuccess',
        discussion: {id: discussionId, commentors: discussion.commentors}
      }
    }
  }

  private findTask(taskId: string) {
    for (const {viewer} of this.threads.values()) {
      const {discussion} = viewer
      const node = discussion?.thread.edges.find(({node}) => node.id === taskId)?.node
      if (discussion && node && isDemoTask(node)) return {discussion, task: node}
    }
    return null
  }

  private updateTask(taskId: string, update: (task: DemoTask) => DemoTask) {
    const found = this.findTask(taskId)
    if (!found) return null
    const {discussion} = found
    const edges = discussion.thread.edges.map((edge) =>
      isDemoTask(edge.node) && edge.node.id === taskId ? {...edge, node: update(edge.node)} : edge
    )
    this.setDiscussion({...discussion, thread: {...discussion.thread, edges}})
    return this.findTask(taskId)!.task
  }

  private get teamMembers() {
    return demoTeammates.map(({id, picture, preferredName}) => ({
      id: demoTeamMemberId(id),
      user: {id, picture, preferredName}
    }))
  }

  createTask: Resolver<CreateTaskMutation> = ({newTask}) => {
    const {discussionId, content, status, sortOrder, threadParentId, threadSortOrder, userId} =
      newTask
    const discussion = discussionId ? this.getThread(discussionId).viewer.discussion : null
    if (!discussion || !discussionId) {
      return {createTask: {error: {message: 'Discussion not found'}, task: null}}
    }
    const assignee = demoTeammates.find(({id}) => id === userId) ?? null
    const resultStage = discussion.discussionTopicId.replace(
      'teamHealthDemoQuestion:',
      'teamHealthDemoResultStage:'
    )
    const taskContent = content ?? toTaskContent('')
    const task = createDemoTask({
      id: `teamHealthDemoVisitorTask_${this.taskCount++}`,
      discussionId,
      stageId: resultStage,
      content: taskContent,
      plaintextContent: generateText(JSON.parse(taskContent), serverTipTapExtensions),
      status,
      author: demoViewer,
      assignee,
      createdAt: new Date().toJSON(),
      sortOrder: sortOrder ?? 0,
      threadSortOrder: threadSortOrder ?? discussion.thread.edges.length,
      threadParentId: threadParentId ?? null
    })
    const edges = [...discussion.thread.edges, {cursor: task.id, node: task}]
    this.setDiscussion({...discussion, thread: {...discussion.thread, edges}})
    return {createTask: {error: null, task}}
  }

  updateTaskFields: Resolver<UpdateTaskMutation> = ({updatedTask}) => {
    const {id, content, status, sortOrder, userId} = updatedTask
    const task = this.updateTask(id, (task) => {
      const assignee = userId === undefined ? undefined : demoTeammates.find((t) => t.id === userId)
      const nextContent = content ?? task.content
      const doc = JSON.parse(nextContent)
      return {
        ...task,
        content: nextContent,
        plaintextContent: generateText(doc, serverTipTapExtensions),
        tags: getTagsFromTipTapTask(doc),
        status: status ?? task.status,
        sortOrder: sortOrder ?? task.sortOrder,
        userId: userId === undefined ? task.userId : userId,
        user:
          userId === undefined
            ? task.user
            : assignee
              ? {id: assignee.id, picture: assignee.picture, preferredName: assignee.preferredName}
              : null,
        updatedAt: new Date().toJSON()
      }
    })
    if (!task)
      return {
        updateTask: {
          error: {message: 'Task not found'},
          task: null,
          addedNotification: null,
          privatizedTaskId: null
        }
      }
    return {updateTask: {error: null, task, addedNotification: null, privatizedTaskId: null}}
  }

  deleteTask: Resolver<DeleteTaskMutation> = ({taskId}) => {
    const found = this.findTask(taskId)
    if (!found) return {deleteTask: {error: {message: 'Task not found'}, task: null}}
    const {discussion} = found
    const edges = discussion.thread.edges.filter(({node}) => node.id !== taskId)
    this.setDiscussion({...discussion, thread: {...discussion.thread, edges}})
    return {deleteTask: {error: null, task: {id: taskId}}}
  }

  editTask: Resolver<EditTaskMutation> = ({taskId, isEditing}) => ({
    editTask: {
      error: null,
      isEditing,
      editor: {id: demoViewer.id, preferredName: demoViewer.preferredName},
      task: {id: taskId}
    }
  })

  setTaskHighlight: Resolver<SetTaskHighlightMutation> = ({taskId, isHighlighted}) => {
    this.updateTask(taskId, (task) => ({...task, isHighlighted}))
    return {
      setTaskHighlight: {
        __typename: 'SetTaskHighlightSuccess',
        task: {__typename: 'Task', id: taskId, isHighlighted}
      }
    }
  }

  updateTaskDueDate: Resolver<UpdateTaskDueDateMutation> = ({taskId, dueDate}) => {
    const task = this.updateTask(taskId, (task) => ({...task, dueDate: dueDate ?? null}))
    if (!task) return {updateTaskDueDate: {error: {message: 'Task not found'}, task: null}}
    return {updateTaskDueDate: {error: null, task: {id: taskId, dueDate: task.dueDate}}}
  }

  // the visitor has no integrations, so the integrate menu has nothing to list. The demo swaps that
  // menu for a preview dialog, see TaskFooterIntegrateToggle
  integrateMenu: Resolver<TaskFooterIntegrateMenuQuery> = ({userId}) => {
    const assignee = demoTeammates.find(({id}) => id === userId) ?? demoViewer
    return {
      viewer: {
        id: demoViewer.id,
        assigneeTeamMember: {
          id: demoTeamMemberId(assignee.id),
          user: {id: assignee.id, preferredName: assignee.preferredName},
          prevUsedRepoIntegrations: {items: []},
          services: []
        },
        viewerTeamMember: {id: demoTeamMemberId(demoViewer.id), services: []}
      }
    }
  }

  assigneeMenu: Resolver<TaskFooterUserAssigneeMenuQuery> = ({teamId}) => ({
    viewer: {
      id: demoViewer.id,
      team: {id: teamId, teamId, teamMembers: this.teamMembers}
    }
  })

  mentionConfig: Resolver<tiptapMentionConfigQuery> = ({teamId}) => ({
    viewer: {id: demoViewer.id, team: {id: teamId, teamMembers: this.teamMembers}}
  })

  dragResultStage: Resolver<useDragTeamHealthResultStageMutation> = ({stageId, sortOrder}) => {
    const {meeting} = this.meeting.viewer
    if (!meeting || !isDemoMeeting(meeting)) throw new Error('Meeting not found')
    const phases = meeting.phases.map((phase) =>
      phase.phaseType !== 'TEAM_HEALTH_RESULT'
        ? phase
        : {
            ...phase,
            stages: phase.stages
              .map((stage) =>
                isDemoResultStage(stage) && stage.id === stageId ? {...stage, sortOrder} : stage
              )
              .sort((a, b) =>
                isDemoResultStage(a) && isDemoResultStage(b) ? a.sortOrder - b.sortOrder : 0
              )
          }
    )
    const nextMeeting = {...meeting, phases}
    this.meeting = {viewer: {...this.meeting.viewer, meeting: nextMeeting}}
    return {dragTeamHealthResultStage: {meeting: nextMeeting}}
  }
}

import EventEmitter from 'eventemitter3'
import {
  Environment,
  type FetchFunction,
  fetchQuery,
  type GraphQLTaggedNode,
  Network,
  Observable,
  type OperationType,
  RecordSource,
  Store,
  type SubscribeFunction,
  type Variables
} from 'relay-runtime'
import handlerProvider from '../../utils/relay/handlerProvider'
import TeamHealthDemoDb from './TeamHealthDemoDb'
import {TeamHealthDemo} from './teamHealthDemoIds'

export default class TeamHealthDemoAtmosphere extends Environment {
  viewerId = TeamHealthDemo.VIEWER_ID
  eventEmitter = new EventEmitter()
  retries = new Set<() => void>()
  db = new TeamHealthDemoDb()

  // every operation the demo can reach, by relay operation name. Anything else has no handler,
  // and since this environment has no transport it fails here instead of reaching a server
  private operations: Record<string, (variables: Variables) => object> = {
    TeamHealthDemoRootQuery: () => this.db.meeting,
    DiscussionThreadQuery: ({discussionId}) => this.db.getThread(discussionId),
    AddCommentMutation: (variables) => this.db.addComment(variables as never),
    AddReactjiToReactableMutation: (variables) => this.db.addReactji(variables as never),
    UpdateCommentContentMutation: (variables) => this.db.updateCommentContent(variables as never),
    DeleteCommentMutation: (variables) => this.db.deleteComment(variables as never),
    EditCommentingMutation: (variables) => this.db.editCommenting(variables as never),
    useDragTeamHealthResultStageMutation: (variables) =>
      this.db.dragResultStage(variables as never),
    CreateTaskMutation: (variables) => this.db.createTask(variables as never),
    UpdateTaskMutation: (variables) => this.db.updateTaskFields(variables as never),
    DeleteTaskMutation: (variables) => this.db.deleteTask(variables as never),
    EditTaskMutation: (variables) => this.db.editTask(variables as never),
    SetTaskHighlightMutation: (variables) => this.db.setTaskHighlight(variables as never),
    UpdateTaskDueDateMutation: (variables) => this.db.updateTaskDueDate(variables as never),
    TaskFooterIntegrateMenuQuery: (variables) => this.db.integrateMenu(variables as never),
    TaskFooterUserAssigneeMenuQuery: (variables) => this.db.assigneeMenu(variables as never),
    tiptapMentionConfigQuery: (variables) => this.db.mentionConfig(variables as never)
  }

  constructor() {
    super({
      store: new Store(new RecordSource(), {gcReleaseBufferSize: 10000}),
      handlerProvider,
      network: Network.create(
        (...args) => this.fetchFixture(...args),
        (...args) => this.subscribeToNothing(...args)
      )
    })
  }

  fetchFixture: FetchFunction = (operation, variables) => {
    const resolve = this.operations[operation.name]
    if (!resolve) {
      return Observable.create((sink) =>
        sink.error(new Error(`${operation.name} is not available in the Team Health demo`))
      )
    }
    // async like a real transport, so relay applies optimistic updates before the response lands
    return Observable.from(Promise.resolve({data: resolve(variables)}))
  }

  subscribeToNothing: SubscribeFunction = () => Observable.create(() => undefined)

  registerQuery = async () => undefined

  scheduleUnregisterQuery = () => undefined

  fetchQuery = async <T extends OperationType>(
    taggedNode: GraphQLTaggedNode,
    variables: Variables = {}
  ) => {
    try {
      return await fetchQuery<T>(this, taggedNode, variables, {
        fetchPolicy: 'store-or-network'
      }).toPromise()
    } catch {
      return null
    }
  }
}

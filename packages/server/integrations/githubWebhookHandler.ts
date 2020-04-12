import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'

// const getPublicKey = ({repository: {id}}) => String(id)

// TODO when this is all legit, we'll map through the queries & use the ASTs instead of the strings
// const eventLookup = {
// issues: {
// TODO pick this back up for epic 8
//  assigned: {
//  getVars: ({repository, issue, assignee}) => ({
//    nameWithOwner: repository.full_name,
//    integrationId: issue.id,
//    assigneeLogin: assignee.login
//  }),
//  query: `
//    mutation GitHubAddAssignee($assigneeLogin: ID! $integrationId: ID!, $nameWithOwner: ID!) {
//      githubAddMember(assigneeLogin: $assigneeLogin, integrationId: $integrationId, nameWithOwner: $nameWithOwner)
//    }
//  `
//  }
// },
// issue_comment: {},
// label: {},
// member: {},
// milestone: {},
// pull_request: {},
// pull_request_review: {},
//
// organization: {
// _getPublickKey: ({organization: {id}}) => String(id)
// REMOVED SINCE WE'RE NOT HANDLING THESE RIGHT NOW
// member_added: {
//   getVars: ({
//     membership: {
//       user: {login: userName}
//     },
//     organization: {login: orgName}
//   }) => ({userName, orgName}),
//   query: `
//     mutation GitHubAddMember($userName: ID! $orgName: ID!) {
//       githubAddMember(userName: $userName, orgName: $orgName)
//     }
//   `
// },
// member_removed: {
//   getVars: ({
//     membership: {
//       user: {login: userName}
//     },
//     organization: {login: orgName}
//   }) => ({userName, orgName}),
//   query: `
//     mutation GitHubRemoveMember($userName: ID! $orgName: ID!) {
//       githubRemoveMember(userName: $userName, orgName: $orgName)
//     }
//   `
// }
// },
// repository: {}
// }

const githubWebhookHandler = uWSAsyncHandler(async (_res: HttpResponse, _req: HttpRequest) => {
  return
  // const event = req.getHeader('X-GitHub-Event')
  // const hexDigest = req.getHeader('X-Hub-Signature')
  // const parser = (buffer: Buffer) => buffer.toString()
  // const bodyStr = (await parseBody(res, parser)) as string | null
  // res.end()
  // if (!bodyStr) return
  // const body = JSON.parse(bodyStr)
  // const eventHandler = eventLookup[event!]
  // if (!hexDigest || !eventHandler) return

  // const actionHandler = eventHandler[body.action]
  // const publicKey = eventHandler._getPublickKey
  //   ? eventHandler._getPublickKey(body)
  //   : getPublicKey(body)
  // if (!actionHandler || !publicKey) return

  // const [shaType, hash] = hexDigest.split('=')
  // const githubSecret = signPayload(process.env.GITHUB_WEBHOOK_SECRET, publicKey)
  // const myHash = signPayload(githubSecret, bodyStr, shaType)
  // if (!secureCompare(hash, myHash)) return

  // const {getVars, query} = actionHandler
  // const variables = getVars(body)
  // const authToken = new ServerAuthToken()
  // executeGraphQL({authToken, query, variables, isPrivate: true})
})

export default githubWebhookHandler

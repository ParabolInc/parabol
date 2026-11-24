import type OperationTool from './OperationTool'
import createPage from './operations/CreatePage.graphql?mcp'
import editPage from './operations/EditPage.graphql?mcp'
import getMe from './operations/GetMe.graphql?mcp'
import getMeeting from './operations/GetMeeting.graphql?mcp'
import listMeetings from './operations/ListMeetings.graphql?mcp'
import listTasks from './operations/ListTasks.graphql?mcp'
import readPage from './operations/ReadPage.graphql?mcp'
import searchPages from './operations/SearchPages.graphql?mcp'
import selectTemplate from './operations/SelectTemplate.graphql?mcp'
import setPageContent from './operations/SetPageContent.graphql?mcp'
import startCheckIn from './operations/StartCheckIn.graphql?mcp'
import startRetrospective from './operations/StartRetrospective.graphql?mcp'
import startSprintPoker from './operations/StartSprintPoker.graphql?mcp'
import startStandup from './operations/StartStandup.graphql?mcp'
import startTeamHealth from './operations/StartTeamHealth.graphql?mcp'

const operationTools: OperationTool[] = [
  getMe,
  listMeetings,
  getMeeting,
  listTasks,
  searchPages,
  readPage,
  createPage,
  setPageContent,
  editPage,
  selectTemplate,
  startRetrospective,
  startCheckIn,
  startSprintPoker,
  startStandup,
  startTeamHealth
]

export default operationTools

import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from './graphql'
import removePokerTemplateDimension from './mutations/removePokerTemplateDimension'
import removePokerTemplateScale from './mutations/removePokerTemplateScale'
import removePokerTemplateScaleValue from './mutations/removePokerTemplateScaleValue'
import removeReflection from './mutations/removeReflection'
import removeReflectTemplate from './mutations/removeReflectTemplate'
import removeSlackAuth from './mutations/removeSlackAuth'
import removeTeamMember from './mutations/removeTeamMember'
import renameMeeting from './mutations/renameMeeting'
import renameMeetingTemplate from './mutations/renameMeetingTemplate'
import renamePokerTemplateDimension from './mutations/renamePokerTemplateDimension'
import renamePokerTemplateScale from './mutations/renamePokerTemplateScale'
import resetPassword from './mutations/resetPassword'
import resetRetroMeetingToGroupStage from './mutations/resetRetroMeetingToGroupStage'
import setNotificationStatus from './mutations/setNotificationStatus'
import setPhaseFocus from './mutations/setPhaseFocus'
import setPokerSpectate from './mutations/setPokerSpectate'
import setStageTimer from './mutations/setStageTimer'
import setTaskEstimate from './mutations/setTaskEstimate'
import setTaskHighlight from './mutations/setTaskHighlight'
import startDraggingReflection from './mutations/startDraggingReflection'
import startSprintPoker from './mutations/startSprintPoker'
import toggleTeamDrawer from './mutations/toggleTeamDrawer'
import updateAzureDevOpsDimensionField from './mutations/updateAzureDevOpsDimensionField'
import updateDragLocation from './mutations/updateDragLocation'
import updateGitHubDimensionField from './mutations/updateGitHubDimensionField'
import updateNewCheckInQuestion from './mutations/updateNewCheckInQuestion'
import updatePokerScope from './mutations/updatePokerScope'
import updatePokerTemplateDimensionScale from './mutations/updatePokerTemplateDimensionScale'
import updatePokerTemplateScaleValue from './mutations/updatePokerTemplateScaleValue'
import updateReflectionContent from './mutations/updateReflectionContent'
import updateReflectionGroupTitle from './mutations/updateReflectionGroupTitle'
import updateRetroMaxVotes from './mutations/updateRetroMaxVotes'
import updateTask from './mutations/updateTask'
import updateTaskDueDate from './mutations/updateTaskDueDate'
import updateTeamName from './mutations/updateTeamName'
import updateTemplateScope from './mutations/updateTemplateScope'
import voteForPokerStory from './mutations/voteForPokerStory'
import voteForReflectionGroup from './mutations/voteForReflectionGroup'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Mutation',
  fields: () =>
    ({
      setNotificationStatus,
      removeReflectTemplate,
      removePokerTemplateDimension,
      renameMeeting,
      renameMeetingTemplate,
      renamePokerTemplateDimension,
      renamePokerTemplateScale,
      removePokerTemplateScale,
      removePokerTemplateScaleValue,
      removeReflection,
      removeSlackAuth,
      removeTeamMember,
      resetPassword,
      resetRetroMeetingToGroupStage,
      setPhaseFocus,
      setStageTimer,
      startDraggingReflection,
      startSprintPoker,
      setTaskHighlight,
      updatePokerTemplateDimensionScale,
      updatePokerTemplateScaleValue,
      updateNewCheckInQuestion,
      updateDragLocation,
      updatePokerScope,
      updateReflectionContent,
      updateReflectionGroupTitle,
      updateRetroMaxVotes,
      updateTask,
      updateTaskDueDate,
      updateTeamName,
      updateTemplateScope,
      voteForReflectionGroup,
      voteForPokerStory,
      setPokerSpectate,
      setTaskEstimate,
      toggleTeamDrawer,
      updateGitHubDimensionField,
      updateAzureDevOpsDimensionField
    }) as any
})

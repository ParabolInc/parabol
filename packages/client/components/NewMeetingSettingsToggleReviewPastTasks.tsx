import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingSettingsToggleReviewPastTasks_settings$key} from '~/__generated__/NewMeetingSettingsToggleReviewPastTasks_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import NewMeetingSettingsToggleRow from './NewMeetingSettingsToggleRow'

interface Props {
  settingsRef: NewMeetingSettingsToggleReviewPastTasks_settings$key
  className?: string
}

const NewMeetingSettingsToggleReviewPastTasks = (props: Props) => {
  const {settingsRef, className} = props
  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleReviewPastTasks_settings on TeamMeetingSettings {
        id
        phaseTypes
      }
    `,
    settingsRef
  )
  const {id: settingsId, phaseTypes} = settings
  const hasReviewPastTasks = phaseTypes.includes('updates')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const toggleReviewPastTasks = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {reviewPastTasksEnabled: !hasReviewPastTasks, settingsId},
      {onError, onCompleted}
    )
  }
  return (
    <NewMeetingSettingsToggleRow
      active={hasReviewPastTasks}
      className={className}
      label={'Review Past Tasks'}
      onClick={toggleReviewPastTasks}
    />
  )
}

export default NewMeetingSettingsToggleReviewPastTasks

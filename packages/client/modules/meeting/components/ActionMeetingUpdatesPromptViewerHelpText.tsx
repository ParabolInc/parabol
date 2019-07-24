import React from 'react'

interface Props {
  updateUserHasTasks: boolean
}

const ActionMeetingUpdatesPromptViewerHelpText = ({updateUserHasTasks}: Props) => {
  const helpText = updateUserHasTasks
    ? 'Quick updates only, please.'
    : 'Add cards to track your current work.'
  return <span>{`(Your turn to share. ${helpText})`}</span>
}

export default ActionMeetingUpdatesPromptViewerHelpText

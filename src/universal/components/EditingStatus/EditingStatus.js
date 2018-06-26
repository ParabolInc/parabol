import PropTypes from 'prop-types'
import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import fromNow from 'universal/utils/fromNow'
import Ellipsis from 'universal/components/Ellipsis/Ellipsis'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import DueDateToggle from 'universal/components/DueDateToggle'
import styled from 'react-emotion'

const StatusHeader = styled('div')({
  alignItems: 'center',
  color: appTheme.palette.dark80l,
  display: 'flex',
  fontSize: '.6875rem',
  fontWeight: 400,
  justifyContent: 'space-between',
  lineHeight: '1.375rem',
  minHeight: ui.cardButtonHeight,
  padding: `0 ${ui.cardPaddingBase}`,
  textAlign: 'left'
})

const EditingText = styled('span')(({isEditing}) => ({
  cursor: isEditing ? 'default' : 'pointer'
}))

const makeEditingStatus = (editors, isEditing, timestamp, timestampType) => {
  let editingStatus = null
  const timestampLabel = timestampType === 'createdAt' ? 'Created ' : 'Updated '

  if (editors.length === 0) {
    editingStatus = isEditing ? (
      <span>
        {'Editing'}
        <Ellipsis />
      </span>
    ) : (
      <span>{`${timestampLabel}${fromNow(timestamp)}`}</span>
    )
  } else {
    const editorNames = editors.map((editor) => editor.preferredName)
    // one other is editing
    if (editors.length === 1) {
      const editor = editorNames[0]
      editingStatus = (
        <span>
          {editor}
          {' editing'}
          {isEditing ? ' too' : ''}
          <Ellipsis />
        </span>
      )
    } else if (editors.length === 2) {
      editingStatus = isEditing ? (
        <span>
          several are editing<Ellipsis />
        </span>
      ) : (
        <span>
          {`${editorNames[0]} and ${editorNames[1]} editing`}
          <Ellipsis />
        </span>
      )
    } else {
      editingStatus = (
        <span>
          {'Several are editing'}
          <Ellipsis />
        </span>
      )
    }
  }
  return editingStatus
}

const EditingStatus = (props) => {
  const {
    atmosphere: {userId: myUserId},
    cardIsActive,
    handleClick,
    task,
    timestamp,
    timestampType,
    toggleMenuState
  } = props
  const {editors} = task
  const otherEditors = editors.filter((editor) => editor.userId !== myUserId)
  const isEditing = editors.length > otherEditors.length
  const title = isEditing ? 'Editing…' : 'Tap to toggle Created/Updated'
  return (
    <StatusHeader>
      <EditingText isEditing={isEditing} onClick={handleClick} title={title}>
        {makeEditingStatus(otherEditors, isEditing, timestamp, timestampType)}
      </EditingText>
      <DueDateToggle cardIsActive={cardIsActive} task={task} toggleMenuState={toggleMenuState} />
    </StatusHeader>
  )
}

EditingStatus.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  cardIsActive: PropTypes.bool,
  handleClick: PropTypes.func,
  task: PropTypes.object.isRequired,
  timestamp: PropTypes.string.isRequired,
  timestampType: PropTypes.string,
  toggleMenuState: PropTypes.func.isRequired,
  styles: PropTypes.object
}

export default createFragmentContainer(
  withAtmosphere(EditingStatus),
  graphql`
    fragment EditingStatus_task on Task {
      editors {
        userId
        preferredName
      }
      ...DueDateToggle_task
    }
  `
)

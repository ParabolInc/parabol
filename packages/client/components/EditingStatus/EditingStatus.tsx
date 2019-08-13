import React, {ReactNode} from 'react'
import appTheme from '../../styles/theme/appTheme'
import ui from '../../styles/ui'
import Ellipsis from '../Ellipsis/Ellipsis'
import {createFragmentContainer} from 'react-relay'
import DueDateToggle from '../DueDateToggle'
import styled from '@emotion/styled'
import relativeDate from '../../utils/date/relativeDate'
import graphql from 'babel-plugin-relay/macro'
import {EditingStatus_task} from '__generated__/EditingStatus_task.graphql'
import {TimestampType} from 'containers/EditingStatus/EditingStatusContainer'
import useAtmosphere from '../../hooks/useAtmosphere'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'

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

const EditingText = styled('span')<{isEditing: boolean}>(({isEditing}) => ({
  cursor: isEditing ? 'default' : 'pointer'
}))

const makeEditingStatus = (editors, isEditing, timestamp, timestampType) => {
  let editingStatus: ReactNode = null
  const timestampLabel = timestampType === 'createdAt' ? 'Created ' : 'Updated '

  if (editors.length === 0) {
    editingStatus = isEditing ? (
      <span>
        {'Editing'}
        <Ellipsis />
      </span>
    ) : (
      <span>{`${timestampLabel}${relativeDate(timestamp, {smallDiff: 'just now'})}`}</span>
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
          several are editing
          <Ellipsis />
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

interface Props {
  handleClick: () => void
  isTaskHovered: boolean
  task: EditingStatus_task
  timestamp: string
  timestampType: TimestampType
  useTaskChild: UseTaskChild
}

const EditingStatus = (props: Props) => {
  const {
    handleClick,
    isTaskHovered,
    task,
    timestamp,
    timestampType,
    useTaskChild
  } = props
  const {editors} = task
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const otherEditors = editors.filter((editor) => editor.userId !== viewerId)
  const isEditing = editors.length > otherEditors.length
  const title = isEditing ? 'Editing…' : 'Tap to toggle Created/Updated'
  return (
    <StatusHeader>
      <EditingText isEditing={isEditing} onClick={handleClick} title={title}>
        {makeEditingStatus(otherEditors, isEditing, timestamp, timestampType)}
      </EditingText>
      <DueDateToggle cardIsActive={isEditing || isTaskHovered} task={task} useTaskChild={useTaskChild} />
    </StatusHeader>
  )
}

export default createFragmentContainer(EditingStatus, {
  task: graphql`
    fragment EditingStatus_task on Task {
      editors {
        userId
        preferredName
      }
      ...DueDateToggle_task
    }
  `
})

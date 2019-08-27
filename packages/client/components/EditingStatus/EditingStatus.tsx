import React, {useState, ReactNode} from 'react'
import appTheme from '../../styles/theme/appTheme'
import ui from '../../styles/ui'
import {createFragmentContainer} from 'react-relay'
import DueDateToggle from '../DueDateToggle'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {EditingStatus_task} from '__generated__/EditingStatus_task.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'
import EditingStatusText from './EditingStatusText'

const StatusHeader = styled('div')({
  alignItems: 'flex-start',
  color: appTheme.palette.dark80l,
  display: 'flex',
  fontSize: '.6875rem',
  fontWeight: 400,
  justifyContent: 'space-between',
  lineHeight: '1.375rem',
  minHeight: ui.cardButtonHeight,
  padding: `0 ${ui.cardPaddingBase} 8px`,
  textAlign: 'left'
})

const EditingText = styled('span')<{isEditing: boolean}>(({isEditing}) => ({
  cursor: isEditing ? 'default' : 'pointer'
}))

export type TimestampType = 'createdAt' | 'updatedAt'

interface Props {
  children: ReactNode
  isTaskHovered: boolean
  task: EditingStatus_task
  useTaskChild: UseTaskChild
}

const EditingStatus = (props: Props) => {
  const {
    children,
    isTaskHovered,
    task,
    useTaskChild
  } = props
  const {createdAt, updatedAt, editors} = task
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const otherEditors = editors.filter((editor) => editor.userId !== viewerId)
  const isEditing = editors.length > otherEditors.length
  const title = isEditing ? 'Editing…' : 'Tap to toggle Created/Updated'
  const [timestampType, setTimestampType] = useState<TimestampType>('createdAt')
  const toggleTimestamp = () => {
    setTimestampType(timestampType === 'createdAt' ? 'updatedAt' : 'createdAt')
  }
  const timestamp = timestampType === 'createdAt' ? createdAt : updatedAt
  return (
    <StatusHeader>
      <div>
        {children}
        <EditingText isEditing={isEditing} onClick={toggleTimestamp} title={title}>
          <EditingStatusText editors={otherEditors} isEditing={isEditing} timestamp={timestamp} timestampType={timestampType}/>
        </EditingText>
      </div>
      <DueDateToggle cardIsActive={isEditing || isTaskHovered} task={task} useTaskChild={useTaskChild} />
    </StatusHeader>
  )
}

export default createFragmentContainer(EditingStatus, {
  task: graphql`
    fragment EditingStatus_task on Task {
      createdAt
      updatedAt
      editors {
        userId
        preferredName
      }
      ...DueDateToggle_task
    }
  `
})

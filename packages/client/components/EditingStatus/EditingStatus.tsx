import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, useState} from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import {EditingStatus_task$key} from '~/__generated__/EditingStatus_task.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'
import {PALETTE} from '../../styles/paletteV3'
import {Card} from '../../types/constEnums'
import DueDateToggle from '../DueDateToggle'
import EditingStatusText from './EditingStatusText'

const StatusHeader = styled('div')({
  alignItems: 'flex-start',
  color: PALETTE.SLATE_600,
  display: 'flex',
  fontSize: 11,
  fontWeight: 400,
  justifyContent: 'space-between',
  lineHeight: '20px',
  minHeight: Card.BUTTON_HEIGHT,
  padding: `0 ${Card.PADDING} 8px`,
  textAlign: 'left'
})

const EditingTextWrapper = styled('div')({
  width: '100%'
})

const EditingText = styled('span')<{isEditing: boolean}>(({isEditing}) => ({
  cursor: isEditing ? 'default' : 'pointer'
}))

export type TimestampType = 'createdAt' | 'updatedAt'

interface Props {
  children: ReactNode
  isTaskHovered: boolean
  task: EditingStatus_task$key
  useTaskChild: UseTaskChild
  isArchived?: boolean
}

const EditingStatus = (props: Props) => {
  const {children, isTaskHovered, task: taskRef, useTaskChild, isArchived} = props
  const task = useFragment(
    graphql`
      fragment EditingStatus_task on Task {
        createdAt
        updatedAt
        editors {
          userId
          preferredName
        }
        ...DueDateToggle_task
      }
    `,
    taskRef
  )
  const {createdAt, updatedAt, editors} = task
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const otherEditors = editors.filter((editor) => editor.userId !== viewerId)
  const isEditing = editors.length > otherEditors.length
  const [timestampType, setTimestampType] = useState<TimestampType>('createdAt')
  const toggleTimestamp = (e: React.MouseEvent) => {
    e.preventDefault()
    closeTooltip()
    setTimestampType(timestampType === 'createdAt' ? 'updatedAt' : 'createdAt')
  }
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER, {disabled: isEditing})
  const timestamp = timestampType === 'createdAt' ? createdAt : updatedAt
  return (
    <StatusHeader>
      <EditingTextWrapper>
        {children}
        <EditingText
          isEditing={isEditing}
          onClick={toggleTimestamp}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          ref={tipRef}
        >
          <EditingStatusText
            editors={otherEditors}
            isArchived={isArchived}
            isEditing={isEditing}
            timestamp={timestamp}
            timestampType={timestampType}
          />
        </EditingText>
        {tooltipPortal(<div>{'Toggle Timestamp'}</div>)}
      </EditingTextWrapper>
      <DueDateToggle
        cardIsActive={isEditing || isTaskHovered}
        isArchived={isArchived}
        task={task}
        useTaskChild={useTaskChild}
      />
    </StatusHeader>
  )
}

export default EditingStatus

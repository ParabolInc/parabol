import React, {useState, ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV2'
import {Card} from '../../types/constEnums'
import {createFragmentContainer} from 'react-relay'
import DueDateToggle from '../DueDateToggle'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {EditingStatus_task} from '__generated__/EditingStatus_task.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'
import EditingStatusText from './EditingStatusText'
import useTooltip from 'hooks/useTooltip'
import {MenuPosition} from 'hooks/useCoords'

const StatusHeader = styled('div')({
  alignItems: 'flex-start',
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  fontSize: 11,
  fontWeight: 400,
  justifyContent: 'space-between',
  lineHeight: '20px',
  minHeight: Card.BUTTON_HEIGHT,
  padding: `0 ${Card.PADDING} 8px`,
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
  const {children, isTaskHovered, task, useTaskChild} = props
  const {createdAt, updatedAt, editors} = task
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const otherEditors = editors.filter((editor) => editor.userId !== viewerId)
  const isEditing = editors.length > otherEditors.length
  const [timestampType, setTimestampType] = useState<TimestampType>('createdAt')
  const toggleTimestamp = () => {
    setTimestampType(timestampType === 'createdAt' ? 'updatedAt' : 'createdAt')
  }
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tipRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {disabled: isEditing}
  )
  const timestamp = timestampType === 'createdAt' ? createdAt : updatedAt
  return (
    <StatusHeader>
      <div>
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
            isEditing={isEditing}
            timestamp={timestamp}
            timestampType={timestampType}
          />
        </EditingText>
        {tooltipPortal(<div>{'Toggle timestamp'}</div>)}
      </div>
      <DueDateToggle
        cardIsActive={isEditing || isTaskHovered}
        task={task}
        useTaskChild={useTaskChild}
      />
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

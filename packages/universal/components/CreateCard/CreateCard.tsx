import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {cardHoverShadow} from 'universal/styles/elevation'
import CreateCardRootStyles from './CreateCardRootStyles'
import styled from '@emotion/styled'

const ControlBlock = styled('div')({
  alignContent: 'center',
  alignSelf: 'stretch',
  color: appTheme.palette.mid,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: '1.5',
  textAlign: 'center',
  userSelect: 'none',
  width: '100%'
})

const ControlLabel = styled('div')({
  fontSize: ui.cardContentFontSize,
  fontWeight: 600
})

const ControlHint = styled('div')({
  fontSize: 13,
  opacity: 0.7
})

const Card = styled('div')<{hasControls: boolean | undefined}>(({hasControls}) => ({
  ...CreateCardRootStyles,
  backgroundColor: hasControls ? ui.cardControlBackgroundColor : 'transparent',
  border: `.0625rem dashed ${appTheme.palette.mid30l}`,
  borderTop: hasControls ? 0 : undefined,
  transition: hasControls ? 'background-color 100ms ease-in, box-shadow 100ms ease-in' : undefined,
  boxShadow: 'none',
  paddingLeft: 0,
  paddingRight: 0,
  '&:hover': hasControls ? {
    backgroundColor: ui.palette.white,
    boxShadow: cardHoverShadow,
    cursor: 'pointer'
  } : undefined
}))

interface Props {
  handleAddTask?: (e: React.MouseEvent) => void
  hasControls?: boolean
}

const CreateCard = (props: Props) => {
  const {handleAddTask, hasControls} = props
  return (
    <Card hasControls={hasControls}>
      {hasControls && (
        <ControlBlock onClick={handleAddTask} title='Add a Task (just press “t”)'>
          <ControlLabel>
            {'Add a '}
            <u>{'T'}</u>
            {'ask'}
          </ControlLabel>
          <ControlHint>
            {'(tag '}
            <b>{'#private'}</b>
            {' for personal Tasks)'}
          </ControlHint>
        </ControlBlock>
      )}
    </Card>
  )
}

export default CreateCard

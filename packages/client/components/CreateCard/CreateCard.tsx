import React from 'react'
import {PALETTE} from '../../styles/paletteV2'
import {Cards} from '../../types/constEnums'
import {cardHoverShadow} from '../../styles/elevation'
import CreateCardRootStyles from './CreateCardRootStyles'
import styled from '@emotion/styled'

const ControlBlock = styled('div')({
  alignContent: 'center',
  alignSelf: 'stretch',
  color: PALETTE.LINK_BLUE,
  display: 'flex',
  flexDirection: 'column',
  fontSize: Cards.FONT_SIZE,
  justifyContent: 'center',
  lineHeight: Cards.LINE_HEIGHT,
  textAlign: 'center',
  userSelect: 'none',
  width: '100%'
})

const ControlLabel = styled('div')({
  fontWeight: 600
})

const ControlHint = styled('div')({
  color: PALETTE.TEXT_GRAY
})

const Card = styled('div')<{hasControls: boolean | undefined}>(({hasControls}) => ({
  ...CreateCardRootStyles,
  backgroundColor: hasControls ? PALETTE.BACKGROUND_PRIMARY_10 : 'transparent',
  border: hasControls ? undefined : `1px dashed ${PALETTE.BORDER_GRAY_65}`,
  borderTop: hasControls ? 0 : undefined,
  transition: hasControls ? 'background-color 100ms ease-in, box-shadow 100ms ease-in' : undefined,
  boxShadow: 'none',
  paddingLeft: 0,
  paddingRight: 0,
  '&:hover': hasControls ? {
    backgroundColor: '#fff',
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

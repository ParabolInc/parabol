import React from 'react'
import {PALETTE} from '../../styles/paletteV2'
import {Card} from '../../types/constEnums'
import {cardHoverShadow} from '../../styles/elevation'
import CreateCardRootStyles from './CreateCardRootStyles'
import styled from '@emotion/styled'

const ControlBlock = styled('div')({
  alignContent: 'center',
  alignSelf: 'stretch',
  color: PALETTE.LINK_BLUE,
  display: 'flex',
  flexDirection: 'column',
  fontSize: Card.FONT_SIZE,
  justifyContent: 'center',
  lineHeight: Card.LINE_HEIGHT,
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

const CreateCardBlock = styled('div')<{hasControls: boolean | undefined}>(({hasControls}) => ({
  ...CreateCardRootStyles,
  backgroundColor: hasControls ? PALETTE.BACKGROUND_PRIMARY_10A : 'transparent',
  border: hasControls ? undefined : `1px dashed ${PALETTE.BORDER_PLACEHOLDER}`,
  borderTop: hasControls ? 0 : undefined,
  transition: hasControls ? 'background-color 100ms ease-in, box-shadow 100ms ease-in' : undefined,
  boxShadow: 'none',
  paddingLeft: 0,
  paddingRight: 0,
  '&:hover': hasControls
    ? {
        background: Card.BACKGROUND_COLOR,
        boxShadow: cardHoverShadow,
        cursor: 'pointer'
      }
    : undefined
}))

interface Props {
  handleAddTask?: (e: React.MouseEvent) => void
  hasControls?: boolean
}

const CreateCard = (props: Props) => {
  const {handleAddTask, hasControls} = props
  return (
    <CreateCardBlock hasControls={hasControls}>
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
    </CreateCardBlock>
  )
}

export default CreateCard

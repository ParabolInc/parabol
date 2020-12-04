import React, {MouseEvent} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import {ElementWidth} from '~/types/constEnums'
import ExpandArrowSVG from '../../../static/images/icons/arrow_expand.svg'
import FlatButton from './FlatButton'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import Icon from './Icon'
import RetroPrompt from './RetroPrompt'

const AddReflectionButton = styled(FlatButton)({
  border: 0,
  height: 24,
  lineHeight: '24px',
  padding: 0,
  width: 24
})

const ButtonGroup = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const ColumnColorDrop = styled('div')<{groupColor: string}>(({groupColor}) => ({
  backgroundColor: groupColor,
  borderRadius: '50%',
  boxShadow: `0 0 0 1px ${PALETTE.BACKGROUND_MAIN}`,
  marginRight: 8,
  height: 8,
  width: 8
}))

const ColumnHeader = styled('div')<{isWidthExpanded: boolean}>(({isWidthExpanded}) => ({
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  justifyContent: 'space-between',
  lineHeight: '24px',
  margin: '0 auto',
  maxWidth: isWidthExpanded
    ? ElementWidth.REFLECTION_CARD_PADDED * 2
    : ElementWidth.REFLECTION_CARD_PADDED,
  paddingTop: 12,
  width: '100%'
}))

const ExpandButton = styled(FlatButton)({
  alignItems: 'center',
  background: 'transparent',
  display: 'flex',
  height: 24,
  marginLeft: 4,
  padding: 0,
  width: 24,
  ':focus, :active': {
    backgroundColor: 'inherit'
  }
})

const Prompt = styled(RetroPrompt)({
  alignItems: 'center',
  display: 'flex',
  marginRight: 8
})

interface Props {
  canAdd: boolean
  groupColor: string
  isWidthExpanded: boolean
  onClick: () => void
  question: string
  submitting: boolean
  toggleWidth: (e: MouseEvent<Element>) => void
}

const GroupingKanbanColumnHeader = (props: Props) => {
  const {canAdd, groupColor, isWidthExpanded, onClick, question, submitting, toggleWidth} = props
  const {
    tooltipPortal: addReflectionPortal,
    openTooltip: openReflectionTooltip,
    closeTooltip: closeReflectionTooltip,
    originRef: addReflectionRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )

  const handleClick = () => {
    onClick()
    closeReflectionTooltip()
  }

  return (
    <ColumnHeader isWidthExpanded={!!isWidthExpanded}>
      <Prompt>
        <ColumnColorDrop groupColor={groupColor} />
        {question}
      </Prompt>
      <ButtonGroup>
        <AddReflectionButton
          dataCy={`add-reflection-${question}`}
          aria-label={'Add a reflection'}
          disabled={!canAdd}
          onClick={handleClick}
          onMouseEnter={openReflectionTooltip}
          onMouseLeave={closeReflectionTooltip}
          ref={addReflectionRef}
          waiting={submitting}
        >
          <Icon>add</Icon>
        </AddReflectionButton>
        {addReflectionPortal(<div>Add new reflection</div>)}
        <ExpandButton
          onClick={toggleWidth}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          ref={originRef}
        >
          <img alt='expand-arrow-icon' src={ExpandArrowSVG} />
        </ExpandButton>
        {tooltipPortal(<div>{`${isWidthExpanded ? 'Minimise' : 'Expand'}`}</div>)}
      </ButtonGroup>
    </ColumnHeader>
  )
}

export default GroupingKanbanColumnHeader

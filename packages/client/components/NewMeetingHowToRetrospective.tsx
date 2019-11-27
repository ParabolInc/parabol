import React from 'react'
import {ExternalLinks} from '../types/constEnums'
import IconLabel from './IconLabel'
import styled from '@emotion/styled'
import LinkButton from './LinkButton'
import HowToStepItem from './HowToStepItem'
import {PALETTE} from '../styles/paletteV2'

const steps = [
  'Write anonymous reflection cards',
  'Drag cards to group common themes',
  'Vote on topics you want to discuss',
  'Create takeaway tasks to make improvements'
]

const LearnMoreLink = styled(LinkButton)({
  fontSize: 16,
  justifySelf: 'start',
  gridColumnStart: 2
})

const HowToBlock = styled('div')({
  display: 'grid',
  gridColumnGap: 16,
  gridRow: '2 / 3',
  gridRowGap: 20,
  gridTemplateColumns: '32px'
})

const HowToTitle = styled('div')({
  color: PALETTE.TEXT_MAIN,
  gridColumnStart: 2,
  fontSize: 24,
  fontWeight: 600,
  paddingBottom: 4
})

const NewMeetingHowToRetrospective = () => {
  return (
    <HowToBlock>
      <HowToTitle>How to Run a Retro Meeting</HowToTitle>
      {steps.map((step, idx) => {
        return <HowToStepItem key={idx} number={idx + 1} step={step} />
      })}
      <LearnMoreLink
        palette='blue'
        onClick={() => window.open(ExternalLinks.GETTING_STARTED_RETROS, '_blank')}
      >
        <IconLabel icon='open_in_new' iconAfter label='Learn More' />
      </LearnMoreLink>
    </HowToBlock>
  )
}

export default NewMeetingHowToRetrospective

import React from 'react'
import {ExternalLinks} from '../types/constEnums'
import IconLabel from './IconLabel'
import styled from '@emotion/styled'
import LinkButton from './LinkButton'
import HowToStepItem from './HowToStepItem'
import {PALETTE} from '../styles/paletteV2'
import {MeetingTypeEnum} from '../types/graphql'

const STEPS = {
  [MeetingTypeEnum.retrospective]: [
    'Write anonymous reflection cards',
    'Drag cards to group common themes',
    'Vote on topics you want to discuss',
    'Create takeaway tasks to make improvements'
  ],
  [MeetingTypeEnum.action]: [
    'Add agenda items throughout the week',
    'Update your team on work in progress',
    'Discuss agenda items with your team',
    'Create takeaway tasks to accomplish'
  ]
}

const LINKS = {
  [MeetingTypeEnum.retrospective]: ExternalLinks.GETTING_STARTED_RETROS,
  [MeetingTypeEnum.action]: ExternalLinks.GETTING_STARTED_ACTION
}

const TITLES = {
  [MeetingTypeEnum.retrospective]: 'How to Run a Retro Meeting',
  [MeetingTypeEnum.action]: 'How to Run an Action Meeting'
}

const LearnMoreLink = styled(LinkButton)({
  fontSize: 16,
  justifySelf: 'start',
  gridColumnStart: 2
})

const HowToBlock = styled('div')({
  display: 'grid',
  gridColumnGap: 16,
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

interface Props {
  meetingType: MeetingTypeEnum
  showTitle?: boolean
}

const NewMeetingHowToSteps = (props: Props) => {
  const {meetingType, showTitle} = props
  const steps = STEPS[meetingType]
  const learnMore = LINKS[meetingType]

  return (
    <HowToBlock>
      {showTitle && <HowToTitle>{TITLES[meetingType]}</HowToTitle>}
      {steps.map((step, idx) => {
        return <HowToStepItem key={idx} number={idx + 1} step={step} />
      })}
      <LearnMoreLink palette='blue' onClick={() => window.open(learnMore, '_blank', 'noreferrer')}>
        <IconLabel icon='open_in_new' iconAfter label='Learn More' />
      </LearnMoreLink>
    </HowToBlock>
  )
}

export default NewMeetingHowToSteps

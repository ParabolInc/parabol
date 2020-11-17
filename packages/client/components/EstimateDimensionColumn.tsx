import React from 'react'
import styled from '@emotion/styled'
// import PokerActiveVoting from './PokerActiveVoting'
// import PokerDiscussVoting from './PokerDiscussVoting'
import LinkButton from './LinkButton'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EstimateDimensionColumn_meeting} from '../__generated__/EstimateDimensionColumn_meeting.graphql'
import {EstimateDimensionColumn_stage} from '../__generated__/EstimateDimensionColumn_stage.graphql'

const ColumnInner = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  width: '100%'
})

const DimensionHeader = styled('div')({
  display: 'flex',
  padding: '8px 16px'
})

const DimensionName = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  marginRight: 'auto'
})

const StyledLinkButton = styled(LinkButton)({
  fontSize: 12,
  fontWeight: 600
})

interface Props {
  meeting: EstimateDimensionColumn_meeting
  stage: EstimateDimensionColumn_stage
  setVotedUserEl: (userId: string, el: HTMLDivElement) => void
}

const EstimateDimensionColumn = (props: Props) => {
  // const {stage, meeting, setVotedUserEl} = props
  const {stage, meeting} = props
  console.dir(meeting)

  // const {settings} = meeting
  // const {selectedTemplate} = settings
  // const {dimensions} = selectedTemplate
  // const {dimensionId} = stage
  // const dimension = dimensions.find(({id}) => id === dimensionId)
  const name = 'Dimension Name'
  // const {name} = dimension

  const {isVoting} = stage

  return (
    <ColumnInner>
      <DimensionHeader>
        <DimensionName>{name}</DimensionName>
        {isVoting ? null : <StyledLinkButton palette={'blue'}>{'Team Revote'}</StyledLinkButton>}
      </DimensionHeader>

      {/* {teamMembers.map((teamMember, idx) => {
        return <div key={idx} ref={(el: HTMLDivElement) => {
          setVotedUserEl(teamMember.userId, el)
        }} />
      })} */}

      {/* {isVoting
        ? <PokerActiveVoting meeting={meeting} stage={stage} />
        : '!isVoting'} */}

      {/* <PokerDiscussVoting selectedScale={selectedScale} scores={scores} teamMembers={teamMembers} /> */}
    </ColumnInner>
  )
}

<<<<<<< Updated upstream
// ...PokerActiveVoting_stage
// ...PokerActiveVoting_meeting

=======
>>>>>>> Stashed changes
export default createFragmentContainer(
  EstimateDimensionColumn,
  {
    meeting: graphql`
    fragment EstimateDimensionColumn_meeting on PokerMeeting {
<<<<<<< Updated upstream
=======
      ...PokerActiveVoting_meeting
>>>>>>> Stashed changes
      settings {
        selectedTemplate {
          dimensions {
            id
            name
          }
        }
      }
    }`,
    stage: graphql`
    fragment EstimateDimensionColumn_stage on EstimateStage {
<<<<<<< Updated upstream
=======
      ...PokerActiveVoting_stage
>>>>>>> Stashed changes
      isVoting
      dimensionId
    }
    `
  }
)

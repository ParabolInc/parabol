import React from 'react'
import styled from '@emotion/styled'
import PokerActiveVoting from './PokerActiveVoting'
import PokerDiscussVoting from './PokerDiscussVoting'
import LinkButton from './LinkButton'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EstimateDimensionColumn_meeting} from '../__generated__/EstimateDimensionColumn_meeting.graphql'
import {EstimateDimensionColumn_stage} from '../__generated__/EstimateDimensionColumn_stage.graphql'
import useMutationProps from '~/hooks/useMutationProps'
import PokerResetDimensionMutation from '../mutations/PokerResetDimensionMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import getGraphQLError from '~/utils/relay/getGraphQLError'
import Atmosphere from '~/Atmosphere'

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
  const atmosphere = useAtmosphere()

  const {stage, meeting, setVotedUserEl} = props
  const {id: meetingId, team} = meeting
  const {teamMembers} = team
  const {id: stageId, dimension} = stage
  const {name} = dimension
  const {isVoting} = stage



  const makeHandleCompleted = (onCompleted: () => void, atmosphere: Atmosphere) => (res, errors) => {
    onCompleted()
    const error = getGraphQLError(res, errors)
    if (error) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'voteError',
        message: error.message || 'Error submitting vote',
        autoDismiss: 5
      })
    }
  }
  const {onError, onCompleted, submitMutation} = useMutationProps()
  const reset = () => {
    submitMutation()
    const handleCompleted = makeHandleCompleted(onCompleted, atmosphere)
    PokerResetDimensionMutation(
      atmosphere,
      {meetingId, stageId},
      {onError, onCompleted: handleCompleted}
    )
  }

  return (
    <ColumnInner>
      <DimensionHeader>
        <DimensionName>{name}</DimensionName>
        {isVoting ? null : <StyledLinkButton onClick={reset} palette={'blue'}>{'Team Revote'}</StyledLinkButton>}
      </DimensionHeader>
      {/* todo: animate avatars to their respective row */}
      {teamMembers.map((teamMember, idx) => {
        return <div key={idx} ref={(el: HTMLDivElement) => {
          setVotedUserEl(teamMember.userId, el)
        }} />
      })}
      {isVoting
        ? <PokerActiveVoting meeting={meeting} stage={stage} />
        : <PokerDiscussVoting meeting={meeting} stage={stage} />
      }
    </ColumnInner>
  )
}

export default createFragmentContainer(
  EstimateDimensionColumn,
  {
    meeting: graphql`
    fragment EstimateDimensionColumn_meeting on PokerMeeting {
      ...PokerActiveVoting_meeting
      ...PokerDiscussVoting_meeting
      id
      team {
        teamMembers {
          userId
          picture
        }
      }
    }`,
    stage: graphql`
    fragment EstimateDimensionColumn_stage on EstimateStage {
      ...PokerActiveVoting_stage
      ...PokerDiscussVoting_stage
      id
      isVoting
      dimensionId
      dimension {
        name
      }
    }
    `
  }
)

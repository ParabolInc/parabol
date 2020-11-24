import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'
import useIsPokerVotingClosing from '../hooks/useIsPokerVotingClosing'
import PokerResetDimensionMutation from '../mutations/PokerResetDimensionMutation'
import {PALETTE} from '../styles/paletteV2'
import {EstimateDimensionColumn_meeting} from '../__generated__/EstimateDimensionColumn_meeting.graphql'
import {EstimateDimensionColumn_stage} from '../__generated__/EstimateDimensionColumn_stage.graphql'
import LinkButton from './LinkButton'
import PokerActiveVoting from './PokerActiveVoting'
import PokerDiscussVoting from './PokerDiscussVoting'

const ColumnInner = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  width: '100%'
})

const DimensionHeader = styled('div')({
  alignItems: 'center',
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

const StyledError = styled('div')({
  color: PALETTE.ERROR_MAIN,
  fontSize: 12,
  fontWeight: 600,
  paddingRight: 16
})

interface Props {
  stage: EstimateDimensionColumn_stage
  meeting: EstimateDimensionColumn_meeting
}


const EstimateDimensionColumn = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting, stage} = props
  const {facilitatorUserId, id: meetingId} = meeting
  const isFacilitator = viewerId === facilitatorUserId
  const {id: stageId, dimension} = stage
  const {name} = dimension
  const {isVoting} = stage
  const {onError, onCompleted, submitMutation, error, submitting} = useMutationProps()
  const isClosing = useIsPokerVotingClosing(isVoting)

  const reset = () => {
    if (submitting) return
    submitMutation()
    PokerResetDimensionMutation(
      atmosphere,
      {meetingId, stageId},
      {onError, onCompleted}
    )
  }

  const showVoting = isVoting || isClosing
  return (
    <ColumnInner>
      <DimensionHeader>
        <DimensionName>{name}</DimensionName>
        {error && <StyledError>{error.message}</StyledError>}
        {!isVoting && isFacilitator && <StyledLinkButton onClick={reset} palette={'blue'}>{'Team Revote'}</StyledLinkButton>}
      </DimensionHeader>
      {showVoting
        ? <PokerActiveVoting meeting={meeting} stage={stage} isClosing={isClosing} />
        : <PokerDiscussVoting meeting={meeting} stage={stage} />
      }
    </ColumnInner>
  )
}

export default createFragmentContainer(
  EstimateDimensionColumn,
  {
    stage: graphql`
    fragment EstimateDimensionColumn_stage on EstimateStage {
      ...PokerActiveVoting_stage
      ...PokerDiscussVoting_stage
      id
      isVoting
      dimension {
        name
      }
    }
    `,
    meeting: graphql`
    fragment EstimateDimensionColumn_meeting on PokerMeeting {
      ...PokerActiveVoting_meeting
      ...PokerDiscussVoting_meeting
      facilitatorUserId
      id
    }`,

  }
)

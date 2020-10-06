import React from 'react'
import styled from '@emotion/styled'
import MeetingPhaseHeading from '~/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import MeetingCopy from '~/modules/meeting/components/MeetingCopy/MeetingCopy'
import StyledLink from './StyledLink'

const EmptyStateContainer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
})

const StyledHeading = styled(MeetingPhaseHeading)({
  paddingBottom: '16px'
})

const StyledCopy = styled(MeetingCopy)({
  margin: 0,
  padding: '12px 0',
  textAlign: 'center',
  width: '100%'
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const FirstCallWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

interface Props {
  teamId: string
}

const EstimatePhaseEmptyState = (props: Props) => {
  const {teamId} = props
  return (
    <FirstCallWrapper>
      <StyledHeading>No items to estimate?</StyledHeading>
      <StyledCopy>It looks like you haven't added any tasks to be estimated yet.</StyledCopy>
      <StyledCopy>
        Try adding them
        <Link to={`/meet/${teamId}/scope`}>{' here.'}</Link>
      </StyledCopy>
    </FirstCallWrapper>
  )
}

export default EstimatePhaseEmptyState

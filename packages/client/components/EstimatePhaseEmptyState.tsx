import styled from '@emotion/styled'
import MeetingCopy from '~/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '~/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StyledLink from './StyledLink'

const StyledHeading = styled(MeetingPhaseHeading)({
  paddingBottom: '16px',
  textAlign: 'center'
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const EmptyStateContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

interface Props {
  meetingId: string
}

const EstimatePhaseEmptyState = (props: Props) => {
  const {meetingId} = props
  return (
    <EmptyStateContainer>
      <StyledHeading>No items to estimate?</StyledHeading>
      <MeetingCopy className='m-0 py-3 text-center'>
        It looks like you haven't added any items yet.
      </MeetingCopy>
      <MeetingCopy className='m-0 py-3 text-center'>
        Try adding them
        <Link to={`/meet/${meetingId}/scope`}>{' here.'}</Link>
      </MeetingCopy>
    </EmptyStateContainer>
  )
}

export default EstimatePhaseEmptyState

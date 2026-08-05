import MeetingCopy from '~/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '~/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StyledLink from './StyledLink'

interface Props {
  meetingId: string
}

const EstimatePhaseEmptyState = (props: Props) => {
  const {meetingId} = props
  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <MeetingPhaseHeading className='pb-4 text-center'>No items to estimate?</MeetingPhaseHeading>
      <MeetingCopy className='m-0 py-3 text-center'>
        It looks like you haven't added any items yet.
      </MeetingCopy>
      <MeetingCopy className='m-0 py-3 text-center'>
        Try adding them
        <StyledLink className='font-semibold' to={`/meet/${meetingId}/scope`}>
          {' here.'}
        </StyledLink>
      </MeetingCopy>
    </div>
  )
}

export default EstimatePhaseEmptyState

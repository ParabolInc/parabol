import styled from '@emotion/styled'

interface Props {
  isComplete: boolean
  isMeeting: boolean
}

const EmptyBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '8px 8px 0 56px'
})

const EmptyMessage = styled('div')({
  color: 'var(--color-fg-secondary)',
  flex: 1,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '20px',
  paddingTop: 4
})

const AgendaListEmptyState = (props: Props) => {
  const {isComplete, isMeeting} = props
  const meetingContext = isMeeting ? 'meeting' : 'next meeting'

  if (isComplete) return null
  return (
    <EmptyBlock>
      <EmptyMessage>
        {`Pssst. Add topics for your ${meetingContext}! Use a phrase like “`}
        <b>
          <i>{'upcoming vacation'}</i>
        </b>
        {'.”'}
      </EmptyMessage>
    </EmptyBlock>
  )
}

export default AgendaListEmptyState

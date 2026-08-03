import styled from '@emotion/styled'
import {ThumbUp} from '@mui/icons-material'
import getRallyLink from '../modules/userDashboard/helpers/getRallyLink'

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 64
})

const ThumbsUp = styled(ThumbUp)({
  height: 48,
  width: 48,
  marginBottom: 16
})

const RallyLink = styled('span')({
  fontWeight: 600,
  color: 'var(--color-accent)'
})

const TimelineNoTasks = () => {
  return (
    <Wrapper>
      <ThumbsUp />
      {'You’re all caught up!'}
      <RallyLink>{getRallyLink()}</RallyLink>
    </Wrapper>
  )
}

export default TimelineNoTasks

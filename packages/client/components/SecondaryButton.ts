import styled from '@emotion/styled'
import FlatButton from './FlatButton'

// Gray, neutral emphasis
const SecondaryButton = styled(FlatButton)({
  borderColor: 'var(--color-hairline-strong)',
  color: 'var(--color-fg-primary)',
  fontWeight: 600
})

export default SecondaryButton

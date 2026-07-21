import styled from '@emotion/styled'
import textOverflow from '../styles/helpers/textOverflow'

const DropdownMenuLabel = styled('div')<{isEmpty?: boolean}>(({isEmpty}) => ({
  ...textOverflow,
  borderBottom: `1px solid var(--color-hairline)`,
  color: 'var(--color-fg-primary)',
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '32px',
  marginBottom: isEmpty ? -8 : 8,
  padding: `0 16px`,
  userSelect: 'none'
}))

export default DropdownMenuLabel

import styled from '@emotion/styled'
import {modalShadow} from '../styles/elevation'
import {Radius} from '../types/constEnums'

const InviteDialog = styled('div')({
  // themed: descendants (DialogTitle, TinyLabel, UnderlineInput) resolve their color from
  // semantic tokens, so a hard-coded white here left them near-white on white in dark mode
  background: 'var(--color-surface-card)',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  display: 'flex',
  flexDirection: 'column'
})

export default InviteDialog

import styled from '@emotion/styled'
import InviteDialog from './InviteDialog'

export const AUTH_DIALOG_WIDTH = 356
const AuthenticationDialog = styled(InviteDialog)({
  alignItems: 'center',
  paddingTop: 24,
  paddingBottom: 24,
  width: AUTH_DIALOG_WIDTH
})

export default AuthenticationDialog

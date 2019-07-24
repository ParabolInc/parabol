import styled from '@emotion/styled'
import {Radius} from '../types/constEnums'
import {modalShadow} from '../styles/elevation'

const AuthDialog = styled('div')({
  backgroundColor: 'white',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  alignItems: 'center',
  maxWidth: 356,
  padding: '24px 0 32px',
  width: '100%'
})

export default AuthDialog

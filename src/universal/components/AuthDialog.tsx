import styled from 'react-emotion'
import {Radius} from 'universal/types/constEnums'
import {modalShadow} from 'universal/styles/elevation'

const AuthDialog = styled('div')({
  backgroundColor: 'white',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  alignItems: 'center',
  height: '100%',
  maxWidth: 356,
  padding: '24px 0 32px',
  width: '100%'
})

export default AuthDialog

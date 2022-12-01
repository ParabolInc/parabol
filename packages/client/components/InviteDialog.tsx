import styled from '@emotion/styled'
import {modalShadow} from '../styles/elevation'
import {Radius} from '../types/constEnums'

const InviteDialog = styled('div')({
  background: 'white',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  display: 'flex',
  flexDirection: 'column'
})

export default InviteDialog

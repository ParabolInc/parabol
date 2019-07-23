import styled from '@emotion/styled'
import {Radius} from 'universal/types/constEnums'
import {modalShadow} from 'universal/styles/elevation'

const InviteDialog = styled('div')({
  background: 'white',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  display: 'flex',
  flexDirection: 'column'
})

export default InviteDialog

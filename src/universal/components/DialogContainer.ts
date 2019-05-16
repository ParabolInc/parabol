import styled from 'react-emotion'
import {modalShadow} from 'universal/styles/elevation'
import {Radius} from 'universal/types/constEnums'

const DialogContainer = styled('div')({
  display: 'flex',
  backgroundColor: 'white',
  borderRadius: Radius.LARGE,
  boxShadow: modalShadow,
  flexDirection: 'column',
  overflow: 'auto',
  margin: '0 auto',
  maxHeight: '90vh',
  maxWidth: 'calc(100vw - 48px)',
  minWidth: 280,
  width: 560
})

export default DialogContainer

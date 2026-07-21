import styled from '@emotion/styled'
import {modalShadow} from '../styles/elevation'
import {Radius} from '../types/constEnums'

const DialogContainer = styled('div')({
  display: 'flex',
  backgroundColor: 'var(--color-surface-card)',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  flexDirection: 'column',
  margin: '0 auto',
  maxHeight: '90vh',
  maxWidth: 'calc(100vw - 48px)',
  minWidth: 280,
  width: 512
})

export default DialogContainer

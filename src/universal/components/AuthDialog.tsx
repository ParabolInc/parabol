import styled from 'react-emotion'
import {cardShadow} from 'universal/styles/elevation'

const AuthDialog = styled('div')({
  backgroundColor: 'white',
  borderRadius: '4px',
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  alignItems: 'center',
  height: '100%',
  maxWidth: '22.25rem',
  padding: '1.25rem 0 2rem',
  width: '100%'
})

export default AuthDialog

import styled from 'react-emotion'
import {menuShadow} from 'universal/styles/elevation'

const MenuContents = styled('div')({
  backgroundColor: '#fff',
  borderRadius: '2px',
  boxShadow: menuShadow,
  outline: 0,
  overflowY: 'auto',
  paddingBottom: 8,
  paddingTop: 8,
  textAlign: 'left',
  width: '100%'
})

export default MenuContents

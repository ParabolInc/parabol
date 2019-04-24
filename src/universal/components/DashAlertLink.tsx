import styled from 'react-emotion'
import {Link} from 'react-router-dom'

const DashAlertLink = styled(Link)({
  color: 'inherit',
  textDecoration: 'underline',
  ':hover, :focus': {
    color: 'inherit',
    opacity: 0.5
  }
})

export default DashAlertLink

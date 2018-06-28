import styled from 'react-emotion'
import appTheme from 'universal/styles/theme/theme'

const UserRowFlatButton = styled('div')({
  alignSelf: 'center',
  color: appTheme.palette.dark,
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: appTheme.typography.s3,
  fontWeight: 600,
  lineHeight: appTheme.typography.s5,
  marginLeft: '1.25rem',
  verticalAlign: 'middle',

  ':hover': {
    opacity: '.5'
  }
})

export default UserRowFlatButton

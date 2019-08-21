import styled from '@emotion/styled'
import appTheme from '../../../../styles/theme/theme'

const UserRowFlatButton = styled('div')({
  alignSelf: 'center',
  color: appTheme.palette.dark,
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  marginLeft: '1.25rem',
  verticalAlign: 'middle',

  ':hover': {
    opacity: '.5'
  }
})

export default UserRowFlatButton

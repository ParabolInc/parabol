import styled from '@emotion/styled'
import ui from '../styles/ui'
import appTheme from '../styles/theme/appTheme'

const InlineAlert = styled('div')({
  backgroundColor: appTheme.palette.yellow50l,
  borderRadius: ui.borderRadiusSmall,
  color: ui.colorText,
  fontSize: '.8125rem', // 13px
  lineHeight: '1.25rem', // 20px
  padding: '.375rem', // 6px
  textAlign: 'center',
  '& a': {
    color: ui.palette.mid,
    textTransform: 'underline',
    ':hover, :focus': {
      textTransform: 'none'
    }
  }
})

export default InlineAlert

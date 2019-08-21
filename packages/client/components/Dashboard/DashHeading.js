import styled from '@emotion/styled'
import ui from '../../styles/ui'
import appTheme from '../../styles/theme/appTheme'

const DashHeading = styled('div')(({textAlign}) => ({
  color: ui.colorText,
  fontSize: 24,
  fontWeight: 600,
  lineHeight: '1.25',
  textAlign,
  [ui.dashBreakpoint]: {
    fontSize: appTheme.typography.s7
  }
}))

export default DashHeading

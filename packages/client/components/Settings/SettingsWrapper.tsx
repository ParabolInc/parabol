import styled from '@emotion/styled'
import {Layout} from '../../types/constEnums'

const SettingsWrapper = styled('div')<{narrow?: boolean}>(({narrow}) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: narrow ? Layout.SETTINGS_NARROW_MAX_WIDTH : Layout.SETTINGS_MAX_WIDTH,
  width: '100%'
}))

export default SettingsWrapper

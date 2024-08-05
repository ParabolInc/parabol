import styled from '@emotion/styled'
import {SETTINGS_MAX_WIDTH, SETTINGS_NARROW_MAX_WIDTH} from '../../utils/constants'

const SettingsWrapper = styled('div')<{narrow?: boolean}>(({narrow}) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: narrow ? SETTINGS_NARROW_MAX_WIDTH : SETTINGS_MAX_WIDTH,
  width: '100%'
}))

export default SettingsWrapper

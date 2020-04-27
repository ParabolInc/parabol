import styled from '@emotion/styled'

const SettingsWrapper = styled('div')<{narrow?: boolean}>(({narrow}) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: narrow ? 644 : 768,
  width: '100%'
}))

export default SettingsWrapper

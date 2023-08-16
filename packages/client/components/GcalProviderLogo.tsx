import styled from '@emotion/styled'
import logo from '../styles/theme/images/graphics/google-calendar.svg'

const GcalProviderLogo = styled('div')({
  background: `url("${logo}")`,
  height: 48,
  width: 48,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat'
})

export default GcalProviderLogo

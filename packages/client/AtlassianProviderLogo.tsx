import styled from '@emotion/styled'
import atlassianMark from './styles/theme/images/graphics/atlassian-gradient.svg'

const AtlassianProviderLogo = styled('div')({
  background: `url("${atlassianMark}")`,
  height: 48,
  width: 48,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat'
})

export default AtlassianProviderLogo

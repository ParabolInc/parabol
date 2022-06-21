import styled from '@emotion/styled'
import logo from '../styles/theme/images/graphics/gitlab-icon-rgb.svg'

const GitLabProviderLogo = styled('div')({
  background: `url("${logo}")`,
  height: 48,
  width: 48,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat'
})

export default GitLabProviderLogo

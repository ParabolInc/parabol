import styled from '@emotion/styled'
import logo from '../styles/theme/images/graphics/mattermost.svg'
import logoWhite from '../styles/theme/images/graphics/mattermost-white.svg'

const MattermostProviderLogo = styled('div')({
  background: `url("${logo}")`,
  height: 48,
  width: 48,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  '.theme-dark &': {
    backgroundImage: `url("${logoWhite}")`
  }
})

export default MattermostProviderLogo

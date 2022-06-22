import styled from '@emotion/styled'
import slackMark from '../styles/theme/images/graphics/slack-color.svg'

const SlackProviderLogo = styled('div')({
  background: `url("${slackMark}")`,
  height: 48,
  width: 48,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat'
})

export default SlackProviderLogo

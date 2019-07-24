import styled from '@emotion/styled'
import ui from '../styles/ui'
import {typeScale} from '../styles/theme/typography'

const TinyLabel = styled('div')({
  color: ui.hintColor,
  fontSize: typeScale[0]
})

export default TinyLabel

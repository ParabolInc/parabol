import styled from '@emotion/styled'
import ui from 'universal/styles/ui'
import {typeScale} from 'universal/styles/theme/typography'

const TinyLabel = styled('div')({
  color: ui.hintColor,
  fontSize: typeScale[0]
})

export default TinyLabel

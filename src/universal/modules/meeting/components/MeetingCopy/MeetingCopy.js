import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'

const MeetingCopy = styled('div')(({margin}) => ({
  color: ui.colorText,
  fontSize: '.8125rem',
  lineHeight: 1.5,
  margin: margin || '1.5em 0',

  [minWidthMediaQueries[1]]: {
    fontSize: '.9375rem'
  }
}))

export default MeetingCopy

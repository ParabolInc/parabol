import styled from '@emotion/styled'
import makeMinWidthQuery from '~/utils/makeMinWidthMediaQuery'

const TimelineEventBody = styled('div')({
  padding: '0 16px 16px 16px',
  fontSize: 14,
  lineHeight: '20px',
  [makeMinWidthQuery(600)]: {
    padding: '0 16px 16px 56px'
  }
})

export default TimelineEventBody

import styled from '@emotion/styled'
import ms from 'ms'
import {Component} from 'react'
import {PALETTE} from '../styles/paletteV3'
import absoluteDate from '../utils/date/absoluteDate'
import relativeDate from '../utils/date/relativeDate'
import SimpleTooltip from './SimpleTooltip'

const StyledSpan = styled('span')({
  color: PALETTE.SLATE_600,
  fontSize: 11,
  lineHeight: '16px'
})

interface State {
  fromNow: string
}

interface Props {
  createdAt: string | Date
}

class TimelineEventDate extends Component<Props, State> {
  state = {
    fromNow: relativeDate(this.props.createdAt)
  }
  intervalId?: number

  componentDidMount() {
    this.intervalId = window.setInterval(() => {
      const fromNow = relativeDate(this.props.createdAt)
      if (fromNow !== this.state.fromNow) {
        this.setState({
          fromNow
        })
      }
    }, ms('1m'))
  }

  componentWillUnmount(): void {
    clearInterval(this.intervalId)
  }

  render() {
    const {fromNow} = this.state
    return (
      <StyledSpan>
        <SimpleTooltip text={absoluteDate(this.props.createdAt)}>{fromNow}</SimpleTooltip>
      </StyledSpan>
    )
  }
}

export default TimelineEventDate

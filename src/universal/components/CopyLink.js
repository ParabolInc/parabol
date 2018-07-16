import PropTypes from 'prop-types'
import React, {Component} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import Tooltip from 'universal/components/Tooltip/Tooltip'

class CopyLink extends Component {
  static propTypes = {
    children: PropTypes.any,
    title: PropTypes.string,
    tooltip: PropTypes.string,
    url: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.confirmationTimeout = null
  }

  state = {
    confirmingCopied: false
  }

  componentWillUnmount () {
    this.clearConfirmationTimeout()
  }

  clearConfirmationTimeout = () => {
    if (this.confirmationTimeout) {
      clearTimeout(this.confirmationTimeout)
    }
  }

  confirmCopied = () => {
    this.clearConfirmationTimeout()
    this.confirmationTimeout = setTimeout(() => {
      this.setState({confirmingCopied: false})
    }, 1500)
    this.setState({confirmingCopied: true})
  }

  render () {
    const {children, title, tooltip, url} = this.props
    const {confirmingCopied} = this.state
    const tip = <div>{tooltip}</div>
    return (
      <Tooltip
        isOpen={confirmingCopied}
        maxHeight={40}
        maxWidth={500}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
        tip={tip}
      >
        <CopyToClipboard text={url} onCopy={this.confirmCopied} title={title}>
          {children}
        </CopyToClipboard>
      </Tooltip>
    )
  }
}

export default CopyLink

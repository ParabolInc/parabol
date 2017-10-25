import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from 'universal/components/Button/Button';
import CopyToClipboard from 'react-copy-to-clipboard';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import voidClick from 'universal/utils/voidClick';

class CopyShortLink extends Component {
  static propTypes = {
    url: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.confirmationTimeout = null;
  }

  state = {
    confirmingCopied: false
  };

  componentWillUnmount() {
    this.clearConfirmationTimeout();
  }

  clearConfirmationTimeout = () => {
    if (this.confirmationTimeout) {
      clearTimeout(this.confirmationTimeout);
    }
  };

  confirmCopied = () => {
    this.clearConfirmationTimeout();
    this.confirmationTimeout = setTimeout(() => {
      this.setState({confirmingCopied: false});
    }, 1500);
    this.setState({confirmingCopied: true});
  };

  render() {
    const {url} = this.props;
    const {confirmingCopied} = this.state;
    const callToAction = 'Copy the meeting link';
    return (
      <Tooltip
        isOpen={confirmingCopied}
        tip={<div>Copied the meeting link!</div>}
        maxHeight={40}
        maxWidth={500}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
      >
        <CopyToClipboard text={url} onCopy={this.confirmCopied}>
          <Button
            aria-label={callToAction}
            buttonSize="small"
            buttonStyle="inverted"
            colorPalette="cool"
            title={callToAction}
            icon="copy"
            iconPlacement="left"
            label={url}
            onClick={voidClick}
          />
        </CopyToClipboard>
      </Tooltip>
    );
  }
}

export default CopyShortLink;

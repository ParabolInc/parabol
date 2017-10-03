import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from 'universal/components/Button/Button';
import CopyToClipboard from 'react-copy-to-clipboard';
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
      this.setState({ confirmingCopied: false });
    }, 1500);
    this.setState({ confirmingCopied: true });
  };

  render() {
    const {url} = this.props;
    const {confirmingCopied} = this.state;
    const callToAction = 'Copy link to meeting';
    return (
      <CopyToClipboard text={url} onCopy={this.confirmCopied}>
        <Button
          aria-label={callToAction}
          size="small"
          buttonStyle="inverted"
          colorPalette="cool"
          disabled={confirmingCopied}
          title={callToAction}
          icon={confirmingCopied ? 'check' : 'copy'}
          iconPlacement="left"
          label={confirmingCopied ? 'Copied!' : url}
          onClick={voidClick}
        />
      </CopyToClipboard>
    );
  }
}

export default CopyShortLink;

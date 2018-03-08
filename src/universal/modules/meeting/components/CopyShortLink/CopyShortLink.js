import PropTypes from 'prop-types';
import React, {Component} from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';
import CopyToClipboard from 'react-copy-to-clipboard';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const CopyIcon = styled(FontAwesome)({
  color: 'inherit',
  display: 'block',
  fontSize: ui.iconSize,
  height: ui.iconSize,
  marginTop: '-.4375rem',
  marginRight: '.5rem',
  position: 'absolute',
  top: '50%',
  right: '100%'
});

const CopyLabel = styled('div')({
  color: 'inherit',
  fontSize: appTheme.typography.s2
});

const CopyBlock = styled('div')({
  color: ui.hintFontColor,
  position: 'relative',
  '&:hover': {
    color: ui.colorText,
    cursor: 'pointer'
  }
});

class CopyShortLink extends Component {
  static propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
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
    const {icon, label, url} = this.props;
    const {confirmingCopied} = this.state;
    const theIcon = icon || 'copy';
    const theLabel = label || url;
    return (
      <Tooltip
        isOpen={confirmingCopied}
        maxHeight={40}
        maxWidth={500}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
        tip={<div>Copied the meeting link!</div>}
      >
        <CopyToClipboard text={url} onCopy={this.confirmCopied}>
          <CopyBlock>
            <CopyIcon name={theIcon} />
            <CopyLabel>{theLabel}</CopyLabel>
          </CopyBlock>
        </CopyToClipboard>
      </Tooltip>
    );
  }
}

export default CopyShortLink;

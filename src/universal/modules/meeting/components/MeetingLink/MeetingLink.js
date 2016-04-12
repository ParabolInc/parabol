import React, { Component, PropTypes } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export default class MeetingLink extends Component {
  static propTypes = {
    hostname: PropTypes.string,
    port: PropTypes.string,
    onChange: PropTypes.func,
    onCopy: PropTypes.func
  }

  onCopy() {
    // Todo: use callback?
    console.log('Meeting URL copied!');
  }

  render() {
    if (!__CLIENT__) return undefined;
    const { props } = this; // eslint-disable-line no-unused-vars
    const currentUrl = window && window.location.href;
    return (
      <div className="input-group">
      {/*
      * Bootstrap input group, using base style configuration
      *
      */}
        <input className="form-control" placeholder={currentUrl} type="text"
          readOnly="true" value={currentUrl} />
        <span className="input-group-btn">
          <CopyToClipboard text={currentUrl} onCopy={this.onCopy}>
            <button className="btn btn-default" type="button">Copy</button>
          </CopyToClipboard>
        </span>
      </div>
    );
  }
}

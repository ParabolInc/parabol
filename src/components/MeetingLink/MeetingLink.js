import React, { Component, PropTypes } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export default class MeetingLink extends Component {
  static propTypes = {
    location: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onCopy: PropTypes.func
  }

  onChange() {
    console.log('Meeting URL input');
  }

  onCopy() {
    console.log('Meeting URL copied!');
  }

  render() {
    const { props } = this;
    const meetingURL = props.location;
    return (
      <div className="input-group">
        {/*
          * Bootstrap input group, using base style configuration
          *
          */}
        <input className="form-control" onChange={this.onChange} placeholder={meetingURL} type="text" value={meetingURL} />
        <span className="input-group-btn">
          <CopyToClipboard text={meetingURL} onCopy={this.onCopy}>
            <button className="btn btn-default" type="button">Copy</button>
          </CopyToClipboard>
        </span>
      </div>
    );
  }
}

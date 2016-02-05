import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';

@connect(
  state => ({
    hostname: state.appInfo.hostname,
    port: state.appInfo.port,
    location: state.router.location.pathname
  })
)
export default class MeetingLink extends Component {
  static propTypes = {
    hostname: PropTypes.string,
    port: PropTypes.string,
    location: PropTypes.string,
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
    const meetingURL = `${props.hostname}${props.port}${props.location}`;
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

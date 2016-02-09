import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';

@connect(
  state => ({
    url: state.appInfo.url,
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

  onCopy() {
    // Todo: use callback?
    console.log('Meeting URL copied!');
  }

  render() {
    const { props } = this;

    return (
      <div className="input-group">
      {/*
      * Bootstrap input group, using base style configuration
      *
      */}
        <input className="form-control" placeholder={props.url} type="text"
          readOnly="true" value={props.url} />
        <span className="input-group-btn">
          <CopyToClipboard text={props.url} onCopy={this.onCopy}>
            <button className="btn btn-default" type="button">Copy</button>
          </CopyToClipboard>
        </span>
      </div>
    );
  }
}

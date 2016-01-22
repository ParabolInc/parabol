import React, {PropTypes, Component} from 'react';

export default class MeetingLink extends Component {
  static propTypes = {
    onMeetingLinkInputChange: PropTypes.func.isRequired,
    onMeetingLinkButtonClicked: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired
  }
  render() {
    const props = this.props;
    return (
      <div className="input-group">
        {/*
          * Bootstrap input group, using base style configuration
          * Todo: Style refactor (TA)
          *
          */}
        <input className="form-control" onChange={() => props.onMeetingLinkInputChange()} placeholder={props.url} type="text" value={props.url} />
        <span className="input-group-btn">
          <button className="btn btn-default" onClick={() => props.onMeetingLinkButtonClicked()} type="button">Copy</button>
        </span>
      </div>
    );
  }
}

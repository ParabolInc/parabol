import React, {Component} from 'react';

export default class MeetingLink extends Component {
  render() {
    return (
      <div className="input-group">
        {/*
          * Bootstrap input group, using base style configuration
          * Todo: Style refactor (TA)
          *
          */}
        <input className="form-control" placeholder="https://so.me/link" type="text" value="https://so.me/link" />
        <span className="input-group-btn">
          <button className="btn btn-default" type="button">Copy</button>
        </span>
      </div>
    );
  }
}

import React, {PropTypes, Component} from 'react';
import { MeetingLink } from 'components';

export default class MeetingHeader extends Component {
  static propTypes = {
    onMeetingNameChange: PropTypes.func.isRequired,
    meetingName: PropTypes.string.isRequired
  }
  render() {
    const styles = require('./MeetingHeader.scss');
    const props = this.props;
    const handleOnMeetingLinkInputChange = () => {
      console.log('handleOnMeetingLinkInputChange');
    };
    const handleOnMeetingLinkButtonClicked = () => {
      console.log('handleOnMeetingLinkButtonClicked');
    };
    return (
      <div className={styles.root}>
        <div className={styles.linkBlock}>
          <MeetingLink
            onMeetingLinkInputChange={() => handleOnMeetingLinkInputChange()}
            onMeetingLinkButtonClicked={() => handleOnMeetingLinkButtonClicked()}
            url="https://so.me/link"
          />
        </div>
        <div className={styles.label}>
          Action Meeting
        </div>
        <input className={styles.name}
               onChange={() => props.onMeetingNameChange()}
               placeholder={props.meetingName}
               type="text"
               value={props.meetingName} />
      </div>
    );
  }
}

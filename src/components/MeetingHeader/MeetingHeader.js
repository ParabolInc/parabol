import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './MeetingHeader.scss';
import { MeetingLink } from 'components';

@cssModules(styles)
export default class MeetingHeader extends Component {
  static propTypes = {
    onMeetingNameChange: PropTypes.func.isRequired,
    meetingName: PropTypes.string.isRequired
  }
  render() {
    const props = this.props;
    const handleOnMeetingLinkInputChange = () => {
      console.log('handleOnMeetingLinkInputChange');
    };
    const handleOnMeetingLinkButtonClicked = () => {
      console.log('handleOnMeetingLinkButtonClicked');
    };
    return (
      <div styleName="root">
        <div styleName="linkBlock">
          <MeetingLink
            onMeetingLinkInputChange={() => handleOnMeetingLinkInputChange()}
            onMeetingLinkButtonClicked={() => handleOnMeetingLinkButtonClicked()}
            url="https://so.me/link"
          />
        </div>
        <div styleName="label">
          Action Meeting
        </div>
        <input styleName="name"
               onChange={() => props.onMeetingNameChange()}
               placeholder={props.meetingName}
               type="text"
               value={props.meetingName} />
      </div>
    );
  }
}

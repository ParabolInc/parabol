import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import CopyToClipboard from 'react-copy-to-clipboard';
import theme from 'universal/styles/theme';
import {cashay} from 'cashay';
import voidClick from 'universal/utils/voidClick';
import makeMeetingUrl from 'universal/utils/makeMeetingUrl';
import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import Button from 'universal/components/Button/Button';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import {push} from 'react-router-redux';
import {LOBBY} from 'universal/utils/constants';

let s = {};

const faStyle = {lineHeight: 'inherit'};
const faFontSize = `${14 * 2}px`; // FA based on 14px

const createStartMeetingHandler = (members, teamId) => {
  return () => {
    const self = members.find(member => member.isSelf);
    if (!self) {
      throw new Error('You are not a member! How can that be?');
    }
    const firstFacilitator = members.find(member => member.isFacilitator);
    const safeFirstFacilitator = firstFacilitator || self;
    const facilitatorId = self.isFacilitator ? self.id : safeFirstFacilitator.id;
    const options = {variables: {teamId, facilitatorId}};
    cashay.mutate('startMeeting', options);
  };
};

@look
export default class MeetingLobby extends Component {
  // constructor(props) {
  //   super(props)
  //   const {dispatch, facilitatorPhase, facilitatorPhaseItem, params} = props;
  //   const {teamId} = params;
  //   if (facilitatorPhase && facilitatorPhase !== LOBBY) {
  //     dispatch(push(`/meeting/${teamId}/${facilitatorPhase}/${facilitatorPhaseItem}`));
  //   }
  // }
  //
  // componentWillReceiveProps(nextProps) {
  //   const {dispatch, facilitatorPhase, facilitatorPhaseItem, params} = nextProps;
  //   const {teamId} = params;
  //   if (facilitatorPhase && facilitatorPhase !== LOBBY) {
  //     dispatch(push(`/meeting/${teamId}/${facilitatorPhase}/${facilitatorPhaseItem}`));
  //   }
  // }
  render() {
    const {dispatch, facilitatorPhaseItem, facilitatorPhase, members, params, teamName} = this.props;
    const {teamId} = params;
    // don't let anyone in the lobby after the meeting has started

    const onStartMeetingClick = createStartMeetingHandler(members, teamId);
    const shortUrl = makeMeetingUrl(teamId);
    return (
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <AvatarGroup avatars={members} label="Team:"/>
        </MeetingSection>
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <div className={s.root}>
            <h1 className={s.heading}>Hi, {teamName} Team!</h1>
            <p className={s.label}>Tap to copy and share this meeting:</p>
            {/* */}
            {/* TODO: prevent navigation and show a “Copied!” message inline or toast */}
            {/* */}
            <CopyToClipboard text={shortUrl}>
              <a
                className={s.link}
                href={shortUrl}
                onClick={voidClick}
                title={`Copy link to meeting: ${shortUrl}`}
              >
                <span className={s.linkText}>{shortUrl}</span>
                <span className={s.icon}>
                <FontAwesome name="copy" style={faStyle}/>
              </span>
              </a>
            </CopyToClipboard>
            <h2 className={s.prompt}>Shall we begin with a Check-In round?</h2>
            <Button
              label="Start Meeting"
              onClick={onStartMeetingClick}
              size="large"
              style="outlined"
              theme="cool"
            />
          </div>
          {/* */}
        </MeetingSection>
        {/* */}
      </MeetingMain>
    );
  };
}

// MeetingLobby.propTypes = {
//   shortUrl: PropTypes.string,
//   teamId: PropTypes.string,
//   teamName: PropTypes.string,
//   members: PropTypes.array,
//   params: PropTypes.shape({
//     teamId: PropTypes.string
//   })
// };

s = StyleSheet.create({
  root: {
    textAlign: 'center'
  },

  heading: {
    color: theme.palette.warm,
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s7,
    fontWeight: 700,
    margin: 0
  },

  label: {
    color: theme.palette.dark,
    fontSize: theme.typography.s3,
    fontWeight: 700,
    margin: '4rem 0 0',
    textTransform: 'uppercase'
  },

  link: {
    borderRadius: '.25rem',
    display: 'block',
    fontSize: faFontSize,
    margin: '.5rem 0 4rem',
    padding: '.75rem 1.5rem',
    textDecoration: 'none !important',

    ':hover': {
      backgroundColor: theme.palette.cool10l
    },
    ':focus': {
      backgroundColor: theme.palette.cool10l
    }
  },

  linkText: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },

  icon: {
    display: 'inline-block',
    fontSize: faFontSize,
    marginLeft: '.5rem',
    verticalAlign: 'middle'
  },

  prompt: {
    color: theme.palette.dark,
    margin: '0 0 2rem'
  }
});

// export default look(MeetingLobby);

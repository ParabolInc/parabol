import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {cashay} from 'cashay';
import makeMeetingUrl from 'universal/utils/makeMeetingUrl';
import Button from 'universal/components/Button/Button';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

let s = {};

const createStartMeetingHandler = (members) => {
  return () => {
    const self = members.find(member => member.isSelf);
    if (!self) {
      throw new Error('You are not a member! How can that be?');
    }
    const firstFacilitator = members.find(member => member.isFacilitator);
    const safeFirstFacilitator = firstFacilitator || self;
    const facilitatorId = self.isFacilitator ? self.id : safeFirstFacilitator.id;
    const options = {variables: {facilitatorId}};
    cashay.mutate('startMeeting', options);
  };
};

const MeetingLobby = (props) => {
  const {members, team} = props;
  const {id: teamId, name: teamName} = team;

  const onStartMeetingClick = createStartMeetingHandler(members);
  const shortUrl = makeMeetingUrl(teamId);
  return (
    <MeetingMain>
      {/* */}
      <MeetingSection flexToFill paddingBottom="2rem">
        {/* */}
        <div className={s.root}>
          <MeetingPhaseHeading>Hi, {teamName} Team!</MeetingPhaseHeading>
          <p className={s.label}>Share this meeting:</p>
          <div className={s.urlBlock}>
            <CopyShortLink url={shortUrl} />
          </div>
          <h2 className={s.prompt}>Team Facilitator: begin the Check-In round!</h2>
          <Button
            label="Start Meeting"
            onClick={onStartMeetingClick}
            size="largest"
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

MeetingLobby.propTypes = {
  members: PropTypes.array,
  params: PropTypes.shape({
    teamId: PropTypes.string
  }),
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  teamId: PropTypes.string,
  teamName: PropTypes.string,
};

s = StyleSheet.create({
  root: {
    textAlign: 'center'
  },

  label: {
    color: theme.palette.dark,
    fontSize: theme.typography.s3,
    fontWeight: 700,
    margin: '4rem 0 0',
    textTransform: 'uppercase'
  },

  prompt: {
    color: theme.palette.dark,
    margin: '0 0 2rem'
  },

  urlBlock: {
    margin: '.5rem 0 4rem',
  }
});

export default look(MeetingLobby);

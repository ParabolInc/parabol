import React, {PropTypes} from 'react';
import Type from 'universal/components/Type/Type';
import WelcomeHeading from '../WelcomeHeading/WelcomeHeading';
import Step3RawInvitees from '../Step3RawInvitees/Step3RawInvitees';
import Step3InviteeList from '../Step3InviteeList/Step3InviteeList';

const Step3InviteTeam = (props) => {
  const {invitees, inviteesRaw, teamName, welcome: {existingInvites, teamId}} = props;
  return (
    <div>
      <Type align="center" italic scale="s6">
        Sounds like a great team!
      </Type>
      <WelcomeHeading copy={<span>Let’s invite some folks to the <b>{teamName}</b> team.</span>} />
      <Step3RawInvitees invitees={invitees} inviteesRaw={inviteesRaw} />
      <Step3InviteeList existingInvites={existingInvites} invitees={invitees} teamId={teamId} />
    </div>
  );
};

Step3InviteTeam.propTypes = {
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  teamName: PropTypes.string,
  welcome: PropTypes.object
};

export default Step3InviteTeam;

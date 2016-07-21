import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
// import theme from 'universal/styles/theme';

import Type from 'universal/components/Type/Type';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-avatar.jpg';
import Taya from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import Terry from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

let s = {};

const exampleTeam = {
  shortUrl: 'https://prbl.io/a/b7s8x9',
  teamName: 'Core',
  timerValue: '30:00',
  members: [
    {
      preferredName: 'Jordan Husney',
      avatar: Jordan
    },
    {
      preferredName: 'Matt Krick',
      avatar: Matt
    },
    {
      preferredName: 'Taya Mueller',
      avatar: Taya
    },
    {
      preferredName: 'Terry Acker',
      avatar: Terry
    }
  ]
};

const MeetingRequestsLayout = (props) => {
  const {team} = props;

  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorLocation="requests" location="requests" {...team} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <MeetingSection paddingBottom="4rem" paddingTop="4rem">
            {/* */}
            <Type align="center" bold family="serif" scale="s6" theme="warm">
              Requests
            </Type>
            {/* */}
            <Type align="center" scale="s5">
              Layout coming soon. Check out <a href="/meetingLayout/summary">the Summary layout</a>.
            </Type>
            <div className={s.root}>{/* Make stuff */}</div>
            {/* */}
          </MeetingSection>
          {/* */}
        </MeetingSection>
        {/* */}
      </MeetingMain>
      {/* */}
    </MeetingLayout>
  );
};

s = StyleSheet.create({
  root: {
    content: '"I exist!"'
  }
});

MeetingRequestsLayout.propTypes = {
  team: PropTypes.object.isRequired
};

MeetingRequestsLayout.defaultProps = {
  team: exampleTeam
};

export default look(MeetingRequestsLayout);

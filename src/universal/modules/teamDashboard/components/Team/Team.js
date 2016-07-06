import React, {PropTypes} from 'react';

import DashContent from 'universal/components/DashContent/DashContent';
import DashHeader from 'universal/components/DashHeader/DashHeader';
import DashLayout from 'universal/components/DashLayout/DashLayout';
import DashMain from 'universal/components/DashMain/DashMain';
import DashSidebar from 'universal/components/DashSidebar/DashSidebar';

const Team = (props) => {
  const {dispatch, user} = props;
  const activeTeamId = props.urlParams.id;

  return (
    <DashLayout title="Team Dashboard">
      <DashSidebar
        activeTeamId={activeTeamId}
        dispatch={dispatch}
        user={user}
      />
      <DashMain>
        <DashHeader title="Team Name" meta="https://prbl.io/a/b7s8x9" />
        <DashContent>
          Team Outcomes
        </DashContent>
      </DashMain>
    </DashLayout>
  );
};

Team.propTypes = {
  dispatch: PropTypes.func.isRequired,
  urlParams: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
    memberships: PropTypes.array
  })
};

export default Team;

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import UserColumnsContainer from 'universal/modules/userDashboard/containers/UserColumns/UserColumnsContainer';
import UserTasksHeaderContainer from 'universal/modules/userDashboard/containers/UserTasksHeader/UserTasksHeaderContainer';
import UserDashSearch from 'universal/modules/userDashboard/components/UserDashSearch/UserDashSearch';
import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink';
import Helmet from 'react-helmet';
import makeDateString from 'universal/utils/makeDateString';
import {createFragmentContainer} from 'react-relay';
import DashMain from 'universal/components/Dashboard/DashMain';
import DashHeader from 'universal/components/Dashboard/DashHeader';
import DashHeaderInfo from 'universal/components/Dashboard/DashHeaderInfo';
import DashContent from 'universal/components/Dashboard/DashContent';

const LayoutBlock = styled('div')({
  display: 'flex',
  flex: 1,
  width: '100%'
});

const TasksLayout = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
});

const HeaderCopy = styled('div')({
  color: ui.colorText,
  flex: 1,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: '1.25',
  textAlign: 'right'
});

const RallyLink = styled('span')({
  color: 'inherit',
  fontWeight: 400,
  fontStyle: 'italic'
});

const UserDashMain = (props) => {
  const {viewer} = props;
  const {teams} = viewer;
  return (
    <DashMain>
      <Helmet title="My Dashboard | Parabol" />
      <DashHeader area="userDash">
        <DashHeaderInfo>
          <UserDashSearch viewer={viewer} />
          <HeaderCopy>
            {makeDateString(new Date(), {showDay: true})}
            <br />
            <RallyLink>
              {getRallyLink()}
              {'!'}
            </RallyLink>
          </HeaderCopy>
        </DashHeaderInfo>
      </DashHeader>
      <DashContent padding="0">
        <LayoutBlock>
          <TasksLayout>
            <UserTasksHeaderContainer teams={teams} viewer={viewer} />
            <UserColumnsContainer teams={teams} viewer={viewer} />
          </TasksLayout>
        </LayoutBlock>
      </DashContent>
    </DashMain>
  );
};

UserDashMain.propTypes = {
  teams: PropTypes.array,
  viewer: PropTypes.object
};

export default createFragmentContainer(
  UserDashMain,
  graphql`
    fragment UserDashMain_viewer on User {
      ...UserDashSearch_viewer
      ...UserColumnsContainer_viewer
      teams {
        id
        name
        meetingId
      }
    }
  `
);

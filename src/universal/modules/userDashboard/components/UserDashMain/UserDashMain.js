import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import UserColumnsContainer from 'universal/modules/userDashboard/containers/UserColumns/UserColumnsContainer';
import UserProjectsHeaderContainer from 'universal/modules/userDashboard/containers/UserProjectsHeader/UserProjectsHeaderContainer';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain
} from 'universal/components/Dashboard';
import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import makeDateString from 'universal/utils/makeDateString';

const UserDashMain = (props) => {
  const {styles} = props;
  return (
    <DashMain>
      <Helmet title="My Dashboard | Parabol" />
      <DashHeader>
        <DashHeaderInfo title="My Dashboard">
          <div className={css(styles.headerCopy)}>
            {makeDateString(new Date(), {showDay: true})}<br />
            <span className={css(styles.rallyLink)}>
              <i>{getRallyLink()}!</i>
            </span>
          </div>
        </DashHeaderInfo>
      </DashHeader>
      <DashContent padding="0">
        <div className={css(styles.root)}>
          <div className={css(styles.projectsLayout)}>
            <UserProjectsHeaderContainer />
            <UserColumnsContainer />
          </div>
        </div>
      </DashContent>
    </DashMain>

  );
};

UserDashMain.propTypes = {
  projects: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    width: '100%'
  },

  projectsLayout: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },

  headerCopy: {
    color: appTheme.palette.mid,
    flex: 1,
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,
    lineHeight: '1.25',
    textAlign: 'right'
  },

  rallyLink: {
    color: 'inherit',
    fontWeight: 400
  }
});

export default withStyles(styleThunk)(UserDashMain);

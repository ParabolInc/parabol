import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain,
  makeDateString
} from 'universal/components/Dashboard';
import getRallyLink from '../../helpers/getRallyLink';

const UserDashboard = (props) => {
  const {children, styles} = props;
  return (
    <DashMain>
      <DashHeader>
        <DashHeaderInfo title="My Dashboard">
          {makeDateString()} • <span className={css(styles.crayCrayHover)}>{getRallyLink()}!</span>
        </DashHeaderInfo>
      </DashHeader>
      <DashContent padding="0">
        {children}
      </DashContent>
    </DashMain>
  );
};

UserDashboard.propTypes = {
  children: PropTypes.any,
  projects: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = () => ({
  crayCrayHover: {
    color: 'inherit'
  }
});

export default withStyles(styleThunk)(UserDashboard);

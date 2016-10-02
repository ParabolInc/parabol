import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import DashNavItem from '../Dashboard/DashNavItem';
import appTheme from 'universal/styles/theme/appTheme';

const DashNavList = (props) => {
  const {teams, styles} = props;
  const hasTeams = teams.length > 0;
  return (
    <div className={css(styles.root)}>
      {hasTeams ?
        <div>
          {teams.map((team) =>
            <div className={css(styles.team)} key={`teamNav${team.id}`}>
              <DashNavItem
                href={`/team/${team.id}`}
                label={team.name}
              />
            </div>
          )}
        </div> :
        <div className={css(styles.emptyTeams)}>It appears you are not a member of any team!</div>
      }
    </div>
  );
};

DashNavList.propTypes = {
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      label: PropTypes.string
    })
  )
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  emptyTeams: {
    fontSize: appTheme.typography.f3,
    fontStyle: 'italic',
    padding: '0 0 1rem 1rem'
  }
});

export default withStyles(styleThunk)(DashNavList);

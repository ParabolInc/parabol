import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import DashNavItem from '../Dashboard/DashNavItem';
import appTheme from 'universal/styles/theme/appTheme';
import DashNavItemBaseStyles from '../Dashboard/DashNavItemBaseStyles';
import Ellipsis from '../Ellipsis/Ellipsis';

const DashNavList = (props) => {
  const {isNewTeam, teams, styles} = props;
  const hasTeams = teams.length > 0;
  return (
    <div className={css(styles.root)}>
      {hasTeams ?
        <div>
          {teams.map((team) =>
            <div key={`teamNav${team.id}`}>
              <DashNavItem
                href={`/team/${team.id}`}
                label={team.name}
              />
            </div>
          )}
          {isNewTeam &&
            <div className={css(styles.newTeamPlaceholder)}>
              {'New Team'}<Ellipsis fontSize="1em" />
            </div>
          }
        </div> :
        <div className={css(styles.emptyTeams)}>It appears you are not a member of any team!</div>
      }
    </div>
  );
};

DashNavList.propTypes = {
  isNewTeam: PropTypes.bool,
  styles: PropTypes.object,
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
    fontSize: appTheme.typography.sBase,
    fontStyle: 'italic',
    padding: '0 0 .125rem 1rem'
  },

  newTeamPlaceholder: {
    ...DashNavItemBaseStyles,
    backgroundColor: appTheme.palette.dark50a,
    cursor: 'default'
  }
});

export default withStyles(styleThunk)(DashNavList);

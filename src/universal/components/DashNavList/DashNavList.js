import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import DashNavItem from '../Dashboard/DashNavItem';
import DashNavButton from '../Dashboard/DashNavButton';
import appTheme from 'universal/styles/theme/appTheme';

const DashNavList = (props) => {
  const {teams, styles} = props;
  const hasTeams = teams.length > 0;
  return (
    <div className={css(styles.root)}>
      {hasTeams ?
        <div>
          {teams.map((team) =>
            <div key={`teamNav${team.id}`} className={css(styles.iconAndLink)}>
              {!team.isPaid &&
                <DashNavButton
                  colorPalette="warm"
                  href="/me/organizations"
                  icon="warning"
                  title="Update organization billing to enable this team"
                />
              }
              <DashNavItem
                href={`/team/${team.id}`}
                label={team.name}
                isPaid={team.isPaid}
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

  iconAndLink: {
    position: 'relative'
  }
});

export default withStyles(styleThunk)(DashNavList);

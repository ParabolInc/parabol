import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import DashNavItem from '../Dashboard/DashNavItem';
import theme from 'universal/styles/theme';

let styles = {};

const DashNavItems = (props) => {
  const {teams} = props;
  return (
    <div>
      {teams.map((team, idx) =>
        <div className={styles.team} key={`teamNav${team.href}`}>
          <DashNavItem {...team} />
        </div>
      )}
    </div>
  );
};

const DashNavList = (props) => {
  const {teams} = props;
  const hasTeams = teams.length > 0;
  return (
    <div className={styles.root}>
      {hasTeams ?
        <DashNavItems teams={teams}/> :
        <div className={styles.emptyTeams}>It appears you are not a member of any team!</div>
      }
    </div>
  );
};

DashNavList.propTypes = {
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      label: PropTypes.string.isRequired
    })
  ).isRequired
};

styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  item: {
    padding: '0 0 .5rem'
  },

  emptyTeams: {
    fontSize: theme.typography.f3,
    fontStyle: 'italic',
    padding: '0 0 1rem 1rem'
  }
});

export default look(DashNavList);

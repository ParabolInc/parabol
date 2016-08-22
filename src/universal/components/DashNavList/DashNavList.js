import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import DashNavItem from '../Dashboard/DashNavItem';
import theme from 'universal/styles/theme';

let styles = {};

const DashNavList = (props) => {
  const {teams} = props;
  const hasTeams = teams.length > 0;
  return (
    <div className={styles.root}>
      {hasTeams ?
        <div>
          {teams.map((team) =>
            <div className={styles.team} key={`teamNav${team.href}`}>
              <DashNavItem {...team} />
            </div>
          )}
        </div> :
        <div className={styles.emptyTeams}>It appears you are not a member of any team!</div>
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

styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  emptyTeams: {
    fontSize: theme.typography.f3,
    fontStyle: 'italic',
    padding: '0 0 1rem 1rem'
  }
});

export default look(DashNavList);

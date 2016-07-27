import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import DashNavItem from '../Dashboard/DashNavItem';
import theme from 'universal/styles/theme';

let styles = {};

const DashNavList = (props) => {
  const {dispatch, teams} = props;
  const hasTeams = teams.length > 0;
  return (
    <div className={styles.root}>
      {hasTeams &&
        <div>
          {teams.map((item, index) =>
            <div className={styles.item} key={index}>
              <DashNavItem dispatch={dispatch} {...item} />
            </div>
          )}
        </div>
      }
      {!hasTeams &&
        <div className={styles.emptyTeams}>It appears you are not a member of any team!</div>
      }
    </div>
  );
};

DashNavList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      active: PropTypes.bool,
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

import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import DashNavItem from '../DashNavItem/DashNavItem';
import theme from 'universal/styles/theme';

let styles = {};

const DashNavList = (props) => {
  const hasTeams = props.items[0] !== undefined;
  return (
    <div className={styles.root}>
      {console.log(props.items)}
      {hasTeams &&
        <div>
          {props.items.map((item, index) =>
            <div className={styles.item} key={index}>
              <DashNavItem active={item.active} label={item.label} />
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
  children: PropTypes.any,
  items: PropTypes.array
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

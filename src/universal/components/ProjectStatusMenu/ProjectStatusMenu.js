import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ProjectStatusMenuItem from './ProjectStatusMenuItem';

let styles = {};

const ProjectStatusMenu = props => {
  const {
    currentStatus,
    isArchived
  } = props;

  const onClickItem = (value) => {
    console.log(`ProjectStatusMenuItem onClick ${value}`);
  };

  console.log(`ProjectStatusMenu currentStatus ${currentStatus}`);

  // TODO: Add HotKeys

  return (
    <div className={styles.root}>
      <div className={styles.menuLabel}>Set Status:</div>
      <ProjectStatusMenuItem
        icon="arrow-right"
        isCurrent={currentStatus === 'active'}
        onClick={onClickItem}
        value="active"
      >
        <span className={styles.keystroke}>A</span>ctive
      </ProjectStatusMenuItem>
      <ProjectStatusMenuItem
        icon="exclamation-triangle"
        isCurrent={currentStatus === 'stuck'}
        onClick={onClickItem}
        value="stuck"
      >
        <span className={styles.keystroke}>S</span>tuck
      </ProjectStatusMenuItem>
      <ProjectStatusMenuItem
        icon="check"
        isCurrent={currentStatus === 'done'}
        onClick={onClickItem}
        value="done"
      >
        <span className={styles.keystroke}>D</span>one
      </ProjectStatusMenuItem>
      <ProjectStatusMenuItem
        icon="clock-o"
        isCurrent={currentStatus === 'future'}
        onClick={onClickItem}
        value="future"
      >
        <span className={styles.keystroke}>F</span>uture
      </ProjectStatusMenuItem>
      <div className={styles.hr} />
      {isArchived ?
        <div>isArchived, TODO: Un-archive?</div> :
        <ProjectStatusMenuItem
          icon="archive"
          onClick={onClickItem}
          value="archive"
        >
          Ar<span className={styles.keystroke}>c</span>hive
        </ProjectStatusMenuItem>
      }
    </div>
  );
};

ProjectStatusMenu.propTypes = {
  currentStatus: PropTypes.oneOf([
    'active',
    'stuck',
    'done',
    'future'
  ]),
  isArchived: PropTypes.bool
};

ProjectStatusMenu.defaultProps = {
  currentStatus: 'done',
  isArchived: false
};

styles = StyleSheet.create({
  root: {
    backgroundColor: theme.palette.mid10l,
    border: `1px solid ${theme.palette.mid40l}`,
    borderRadius: '.5rem',
    padding: '0 0 .25rem',
    width: '10rem'
  },

  menuLabel: {
    color: theme.palette.mid,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    padding: '.5rem 0 .25rem 2.75rem'
  },

  keystroke: {
    textDecoration: 'underline'
  },

  hr: {
    borderTop: `1px solid ${theme.palette.mid40l}`,
    height: '1px',
    margin: '.25rem 0',
    width: '100%'
  }
});

export default look(ProjectStatusMenu);

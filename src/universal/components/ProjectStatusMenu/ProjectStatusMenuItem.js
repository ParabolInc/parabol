import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';

const combineStyles = StyleSheet.combineStyles;

const colors = {
  active: theme.palette.dark10d,
  stuck: theme.palette.warm,
  done: theme.palette.cool,
  future: theme.palette.mid,
  archive: theme.palette.dark
};

let styles = {};
const valueArray = labels.projectStatus.slugs.slice(0);

const ProjectStatusMenuItem = props => {
  const {icon, isCurrent, label, onClick, value} = props;

  const color = {
    color: colors[value]
  };

  const backgroundColor = {
    backgroundColor: colors[value]
  };

  const rootStyles = isCurrent ? combineStyles(styles.root, styles.current) : styles.root;

  const handleClick = (e) => {
    e.preventDefault();
    onClick(value);
  };

  return (
    <a className={rootStyles} href="#" onClick={handleClick}>
      <div className={styles.icon} style={backgroundColor}>
        <FontAwesome name={icon} style={{lineHeight: 'inherit'}} />
      </div>
      <div className={styles.label} style={color}>
        {label}
      </div>
    </a>
  );
};

valueArray.push('archive');

ProjectStatusMenuItem.propTypes = {
  icon: PropTypes.string,
  isCurrent: PropTypes.bool,
  label: PropTypes.any,
  onClick: PropTypes.func,
  value: PropTypes.oneOf(valueArray)
};

ProjectStatusMenuItem.defaultProps = {
  icon: labels.projectStatus.active.icon,
  isCurrent: false,
  onClick() {
    console.log('ProjectStatusMenuItem.onClick');
  },
  value: labels.projectStatus.active.slug
};

styles = StyleSheet.create({
  root: {
    cursor: 'pointer',
    display: 'block',
    fontSize: theme.typography.s3,
    padding: '.25rem .75rem',
    width: '100%',

    ':hover': {
      backgroundColor: theme.palette.mid20l
    },
    ':focus': {
      backgroundColor: theme.palette.mid20l
    }
  },

  current: {
    backgroundColor: theme.palette.mid20l,
    cursor: 'default'
  },

  icon: {
    borderRadius: '.5rem',
    color: '#fff',
    display: 'inline-block',
    height: '1.5rem',
    lineHeight: '1.5rem',
    marginRight: '.5rem',
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '1.5rem'
  },

  label: {
    display: 'inline-block',
    fontWeight: 700,
    textTransform: 'uppercase',
    verticalAlign: 'middle'
  }
});

export default look(ProjectStatusMenuItem);

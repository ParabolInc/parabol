import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';

const colors = {
  active: theme.palette.dark10d,
  stuck: theme.palette.warm,
  done: theme.palette.cool,
  future: theme.palette.mid,
  archive: theme.palette.dark
};

let styles = {};

const ProjectStatusMenuItem = props => {
  const {children, icon, onClick, value} = props;

  const color = {
    color: colors[value]
  };

  const backgroundColor = {
    backgroundColor: colors[value]
  };

  return (
    <a className={styles.root} href="#" onClick={onClick}>
      <div className={styles.icon} style={backgroundColor}>
        <FontAwesome name={icon} style={{lineHeight: 'inherit'}} />
      </div>
      <div className={styles.label} style={color}>
        {children}
      </div>
    </a>
  );
};

ProjectStatusMenuItem.propTypes = {
  children: PropTypes.any,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  value: PropTypes.oneOf([
    'active',
    'stuck',
    'done',
    'future',
    'archive'
  ])
};

ProjectStatusMenuItem.defaultProps = {
  icon: 'arrow-right',
  value: 'active'
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

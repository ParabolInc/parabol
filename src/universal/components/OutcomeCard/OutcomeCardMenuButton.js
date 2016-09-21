import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';

const cs = StyleSheet.combineStyles;
const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: theme.palette.mid50l
};
let styles = {};
const statusValues = labels.projectStatus.slugs.slice(0);

const OutcomeCardMenuButton = (props) => {
  const {
    disabled,
    icon,
    label,
    onClick,
    status,
    title
  } = props;

  const buttonStyleOptions = [styles.button, styles[status]];
  if (disabled) {
    buttonStyleOptions.push(styles.disabled);
  }
  const buttonStyles = cs(...buttonStyleOptions);

  return (
    <button
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <FontAwesome name={icon} /> <span className={styles.label}>{label}</span>
    </button>
  );
};

OutcomeCardMenuButton.propTypes = {
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  label: PropTypes.any,
  onClick: PropTypes.func,
  status: PropTypes.oneOf(statusValues),
  title: PropTypes.string
};

OutcomeCardMenuButton.defaultProps = {
  disabled: false,
  icon: labels.projectStatus.active.icon,
  onClick() {
    return console.log('OutcomeCardMenuButton.onClick()');
  },
  status: labels.projectStatus.active.slug
};

styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.25rem',
    cursor: 'pointer',
    margin: 0,
    outline: 'none',
    padding: '.25rem .5rem',
    width: '100%',

    ':hover': {
      ...buttonHF
    },
    ':focus': {
      ...buttonHF,
      borderColor: theme.palette.dark90d
    }
  },

  label: {
    fontWeight: 700,
    textTransform: 'uppercase'
  },

  disabled: {
    cursor: 'not-allowed',
    opacity: '.35'
  },

  ...projectStatusStyles('color'),

  archive: {
    color: labels.archive.color
  },
  archived: {
    color: labels.archived.color
  },
  action: {
    color: labels.action.color
  },
});

export default look(OutcomeCardMenuButton);

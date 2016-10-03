import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';

const OutcomeCardMenuButton = (props) => {
  const {
    disabled,
    icon,
    label,
    onClick,
    status,
    styles,
    title
  } = props;

  const buttonStyles = css(
    styles.button,
    styles[status],
    disabled && styles.disabled
  );

  return (
    <button
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <FontAwesome name={icon} /> <span className={css(styles.label)}>{label}</span>
    </button>
  );
};

const statusValues = labels.projectStatus.slugs.concat('archive');
OutcomeCardMenuButton.propTypes = {
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  label: PropTypes.any,
  onClick: PropTypes.func,
  status: PropTypes.oneOf(statusValues),
  styles: PropTypes.object,
  title: PropTypes.string
};

const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: appTheme.palette.mid50l
};

const styleThunk = () => ({
  button: {
    backgroundColor: 'transparent',
    border: `1px solid ${appTheme.palette.mid30l}`,
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
      borderColor: appTheme.palette.dark90d
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

export default withStyles(styleThunk)(OutcomeCardMenuButton);

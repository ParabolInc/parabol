import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import upperFirst from 'universal/utils/upperFirst';

const cs = StyleSheet.combineStyles;
const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: theme.palette.mid50l
};
let styles = {};

const OutcomeCardStatusMenu = props => {
  const {
    handleButtonClick,
    isArchived,
    status
  } = props;

  console.log(status, isArchived);

  const activeLabel = () =>
    <span className={styles.label}>
      <span className={styles.u}>A</span>ctive
    </span>;

  const stuckLabel = () =>
    <span className={styles.label}>
      <span className={styles.u}>S</span>tuck
    </span>;

  const doneLabel = () =>
    <span className={styles.label}>
      <span className={styles.u}>D</span>one
    </span>;

  const futureLabel = () =>
    <span className={styles.label}>
      <span className={styles.u}>F</span>uture
    </span>;

  const isArchivedLabel = () =>
    <span className={styles.label}>
      Take out of Ar<span className={styles.u}>c</span>hive
    </span>;

  const notArchivedLabel = () =>
    <span className={styles.label}>
      Move to Ar<span className={styles.u}>c</span>hive
    </span>;

  const buttonArray = [
    {
      status: 'active',
      icon: 'arrow-right',
      label: activeLabel
    },
    {
      status: 'stuck',
      icon: 'exclamation-triangle',
      label: stuckLabel
    },
    {
      status: 'done',
      icon: 'check',
      label: doneLabel
    },
    {
      status: 'future',
      icon: 'clock-o',
      label: futureLabel
    }
  ];

  const makeButton = (statusName, icon, label, idx) => {
    let isDisabled = false;
    let buttonStyles;
    const buttonStyleOptions = [styles.button, styles[statusName]];
    if (status === statusName) {
      isDisabled = true;
      buttonStyleOptions.push(styles.disabled);
    }
    buttonStyles = cs.apply('null', buttonStyleOptions);

    return (
      <button
        className={buttonStyles}
        disabled={isDisabled}
        key={idx}
        onClick={handleButtonClick}
        title={`Set status to ${upperFirst(statusName)}`}
      >
        <FontAwesome name={icon} /> {label()}
      </button>
    );
  };

  const archivedLabel = isArchived ? isArchivedLabel : notArchivedLabel;

  return (
    <div className={styles.root}>
      {buttonArray.map((btn, idx) =>
        <div className={styles.col}>
          {makeButton(btn.status, btn.icon, btn.label, idx)}
        </div>
      )}
      <div className={styles.archivedBtnBlock}>
        {makeButton('archived', 'archive', archivedLabel)}
      </div>
    </div>
  );
};

OutcomeCardStatusMenu.propTypes = {
  handleButtonClick: PropTypes.function,
  isArchived: PropTypes.bool,
  status: PropTypes.oneOf([
    'active',
    'stuck',
    'done',
    'future'
  ])
};

OutcomeCardStatusMenu.defaultProps = {
  handleButtonClick() {
    return console.log('OutcomeCardStatusMenu.handleButtonClick()');
  },
  isArchived: false,
  status: 'active'
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    fontSize: 0,
    margin: '0 auto',
    maxWidth: '12rem',
    minHeight: '5.1875rem',
    padding: '.125rem',
    textAlign: 'center',
    width: '100%'
  },

  col: {
    display: 'inline-block',
    fontSize: '1rem',
    padding: '.125rem',
    width: '50%'
  },

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

  u: {
    textDecoration: 'underline'
  },

  disabled: {
    cursor: 'not-allowed',
    opacity: '.35'
  },

  active: {
    color: theme.palette.cool
  },

  stuck: {
    color: theme.palette.warm
  },

  done: {
    color: theme.palette.dark10d
  },

  future: {
    color: theme.palette.mid
  },

  archived: {
    color: theme.palette.dark
  },

  archivedBtnBlock: {
    padding: '.125rem'
  }
});

export default look(OutcomeCardStatusMenu);

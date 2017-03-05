import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {makePlaceholderStyles} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import withHotkey from 'react-hotkey-hoc';
import FontAwesome from 'react-fontawesome';
import shortid from 'shortid';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {cashay} from 'cashay';

const defaultColor = appTheme.palette.dark;
const iconStyle = {
  color: defaultColor,
  display: 'block',
  height: ui.fontSize,
  left: '2.5rem',
  lineHeight: ui.fontSize,
  position: 'absolute',
  top: '.8125rem',
  width: ui.fontSize,
  zIndex: 100
};
const AgendaInputField = (props) => {
  const {
    agenda,
    bindHotkey,
    disabled,
    handleSubmit,
    styles,
    teamId,
    myTeamMemberId
  } = props;
  let inputRef;
  const setRef = (c) => {
    inputRef = c;
  };
  const handleAgendaItemSubmit = (submittedData) => {
    const content = submittedData.agendaItem;
    if (!content) return;
    const options = {
      variables: {
        newAgendaItem: {
          id: `${teamId}::${shortid.generate()}`,
          content,
          sortOrder: getNextSortOrder(agenda),
          teamMemberId: myTeamMemberId
        }
      }
    };
    cashay.mutate('createAgendaItem', options);
    inputRef.blur();
  };

  const focusOnInput = (e) => {
    e.preventDefault();
    inputRef.focus();
  };
  const maybeBlur = (e) => {
    if (e.key === 'Escape') {
      inputRef.blur();
    }
  };
  const rootStyles = css(
    styles.root,
    disabled && styles.rootDisabled
  );
  const inputStyles = css(
    styles.input,
    !disabled && styles.inputNotDisabled
  );
  if (!disabled) { bindHotkey('+', focusOnInput); }
  return (
    <form className={rootStyles} onSubmit={handleSubmit(handleAgendaItemSubmit)}>
      <input
        {...props.input}
        autoCapitalize="off"
        autoComplete="off"
        className={inputStyles}
        disabled={disabled}
        maxLength="63"
        onKeyDown={maybeBlur}
        placeholder="Add Agenda Item"
        ref={setRef}
        title="Add Agenda Item"
        type="text"
      />
      <FontAwesome name="plus-circle" style={iconStyle} />
    </form>
  );
};

AgendaInputField.propTypes = {
  agenda: PropTypes.array,
  bindHotkey: PropTypes.func,
  disabled: PropTypes.bool,
  handleSubmit: PropTypes.func,
  input: PropTypes.object,
  myTeamMemberId: PropTypes.string.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string
};

const inputPlaceholderStyles = makePlaceholderStyles(defaultColor);
const inputFocusActivePlaceholderStyles = makePlaceholderStyles(appTheme.palette.dark50l);
const inputFocusActive = {
  backgroundColor: appTheme.palette.light,
  ...inputFocusActivePlaceholderStyles
};


const styleThunk = () => ({
  root: {
    backgroundColor: 'transparent',
    color: appTheme.palette.cool,
    fontSize: appTheme.typography.s3,
    position: 'relative',
    width: '100%',
    zIndex: 100,

    ':hover': {
      backgroundColor: appTheme.palette.dark20l
    }
  },

  rootDisabled: {
    ':hover': {
      backgroundColor: 'transparent'
    }
  },

  input: {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color: appTheme.palette.dark10d,
    display: 'block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: '1.5rem',
    margin: 0,
    outline: 'none',
    padding: '.5rem 2.5rem .5rem 3rem',
    position: 'relative',
    textIndent: '1rem',
    width: '100%',
    zIndex: 200,

    ...inputPlaceholderStyles,
  },

  inputNotDisabled: {
    ':focus': {
      ...inputFocusActive
    },
    ':active': {
      ...inputFocusActive
    }
  }
});

export default withHotkey(withStyles(styleThunk)(AgendaInputField));

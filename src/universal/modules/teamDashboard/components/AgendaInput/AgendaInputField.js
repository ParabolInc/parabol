import PropTypes from 'prop-types';
import React from 'react';
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
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import Tooltip from 'universal/components/Tooltip/Tooltip';

const iconStyle = {
  color: appTheme.palette.dark,
  display: 'block',
  fontSize: ui.iconSize2x,
  height: ui.iconSize2x,
  left: '1.25rem',
  lineHeight: ui.iconSize2x,
  pointerEvents: 'none',
  position: 'absolute',
  textAlign: 'right',
  top: '.5rem',
  width: ui.iconSize2x,
  zIndex: 200
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
    if (inputRef) {
      inputRef.focus();
    }
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
  const tip = (<div style={{textAlign: 'center'}}>{'Add meeting topics to discuss,'}<br />{'like “upcoming vacation”'}</div>);
  const input = (
    <form className={rootStyles} onSubmit={handleSubmit(handleAgendaItemSubmit)}>
      <input
        {...props.input}
        autoCapitalize="off"
        autoComplete="off"
        className={inputStyles}
        disabled={disabled}
        maxLength="63"
        onKeyDown={maybeBlur}
        placeholder="Next Agenda Item…"
        ref={setRef}
        type="text"
      />
      <FontAwesome name="plus-square-o" style={iconStyle} />
    </form>
  );
  const showTooltip = Boolean(agenda.length > 0 && !disabled);
  return (
    <div>
      {showTooltip ?
        <Tooltip
          delay={1000}
          hideOnFocus
          tip={tip}
          maxHeight={52}
          maxWidth={224}
          originAnchor={{vertical: 'top', horizontal: 'center'}}
          targetAnchor={{vertical: 'bottom', horizontal: 'center'}}
        >
          {input}
        </Tooltip> :
        input
      }
    </div>
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

const inputPlaceholderStyles = makePlaceholderStyles(appTheme.palette.mid60l);

const inputCustomStyles = {
  focus: { backgroundColor: appTheme.palette.light70l },
  active: { backgroundColor: appTheme.palette.light70l }
};

const styleThunk = () => ({
  root: {
    backgroundColor: 'transparent',
    color: appTheme.palette.cool,
    fontSize: appTheme.typography.s3,
    padding: `0 ${ui.meetingSidebarGutter}`,
    position: 'relative',
    width: '100%',
    zIndex: 100
  },

  rootDisabled: {
    ':hover': {
      backgroundColor: 'transparent'
    }
  },

  input: {
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    backgroundColor: 'transparent',
    color: appTheme.palette.dark10d,
    cursor: 'not-allowed',
    display: 'block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: '1.5rem',
    margin: 0,
    outline: 'none',
    padding: '.5rem .5rem .5rem 3rem',
    position: 'relative',
    textIndent: '.1875rem',
    width: '100%',
    zIndex: 200,
    ...makeFieldColorPalette('white', false),
    ...inputPlaceholderStyles
  },

  inputNotDisabled: {
    cursor: 'text',
    ...makeFieldColorPalette('white', true, inputCustomStyles)
  }
});

export default withHotkey(withStyles(styleThunk)(AgendaInputField));

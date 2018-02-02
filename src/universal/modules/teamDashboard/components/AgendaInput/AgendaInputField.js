import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import withHotkey from 'react-hotkey-hoc';
import {createFragmentContainer} from 'react-relay';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import AddAgendaItemMutation from 'universal/mutations/AddAgendaItemMutation';
import {makePlaceholderStyles} from 'universal/styles/helpers';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

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

const hasFocus = (element) => (
  element && document.activeElement === element
);

class AgendaInputField extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    bindHotkey: PropTypes.func,
    disabled: PropTypes.bool,
    handleSubmit: PropTypes.func,
    input: PropTypes.object,
    afterSubmitAgendaItem: PropTypes.func.isRequired,
    setAgendaInputRef: PropTypes.func,
    styles: PropTypes.object,
    team: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {disabled, bindHotkey} = this.props;
    if (!disabled) {
      bindHotkey('+', this.focusOnInput);
    }
  }

  componentWillUpdate() {
    this.maybeSaveFocus();
  }

  componentDidUpdate() {
    this.maybeRefocus();
  }

  setRef = (c) => {
    const {setAgendaInputRef} = this.props;
    this.inputRef = c;
    if (setAgendaInputRef) {
      setAgendaInputRef(c);
    }
  };

  inputRef = null;
  refocusAfterUpdate = false;

  focusOnInput = (e) => {
    e.preventDefault();
    if (this.inputRef) {
      this.inputRef.focus();
    }
  };

  handleAgendaItemSubmit = (submittedData) => {
    const {afterSubmitAgendaItem, atmosphere, team: {agendaItems, teamId}} = this.props;
    const content = submittedData.agendaItem;
    if (!content) return;
    const newAgendaItem = {
      content,
      sortOrder: getNextSortOrder(agendaItems),
      teamId,
      teamMemberId: toTeamMemberId(teamId, atmosphere.userId)
    };
    AddAgendaItemMutation(atmosphere, newAgendaItem);
    afterSubmitAgendaItem();
  };

  makeForm = () => {
    const {disabled, handleSubmit, styles} = this.props;
    const rootStyles = css(
      styles.root,
      disabled && styles.rootDisabled
    );
    const inputStyles = css(
      styles.input,
      !disabled && styles.inputNotDisabled
    );
    return (
      <form className={rootStyles} onSubmit={handleSubmit(this.handleAgendaItemSubmit)}>
        <input
          {...this.props.input}
          autoCapitalize="off"
          autoComplete="off"
          className={inputStyles}
          disabled={disabled}
          maxLength="63"
          onKeyDown={this.maybeBlur}
          placeholder="Add Agenda Topic…"
          ref={this.setRef}
          type="text"
        />
        <FontAwesome name="plus-square-o" style={iconStyle} />
      </form>
    );
  };

  makeTooltip = () => (
    <div style={{textAlign: 'center'}}>
      {'Add meeting topics to discuss,'}<br />{'like “upcoming vacation”'}
    </div>
  );

  maybeBlur = (e) => {
    if (e.key === 'Escape') {
      this.inputRef.blur();
    }
  };

  maybeRefocus = () => {
    if (this.inputRef && this.refocusAfterUpdate) {
      this.inputRef.focus();
      this.refocusAfterUpdate = false;
    }
  };

  maybeSaveFocus = () => {
    if (hasFocus(this.inputRef)) {
      this.refocusAfterUpdate = true;
    }
  };

  render() {
    const {
      disabled,
      team: {agendaItems}
    } = this.props;

    const form = this.makeForm();
    const showTooltip = Boolean(agendaItems.length > 0 && !disabled);
    return (
      <div>
        {showTooltip ? (
          <Tooltip
            delay={1000}
            hideOnFocus
            tip={this.makeTooltip()}
            maxHeight={52}
            maxWidth={224}
            originAnchor={{vertical: 'top', horizontal: 'center'}}
            targetAnchor={{vertical: 'bottom', horizontal: 'center'}}
          >
            {form}
          </Tooltip>
        ) : (
          form
        )}
      </div>
    );
  }
}

const inputPlaceholderStyles = makePlaceholderStyles(appTheme.palette.mid60l);

const inputCustomStyles = {
  focus: {backgroundColor: appTheme.palette.light70l},
  active: {backgroundColor: appTheme.palette.light70l}
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

export default createFragmentContainer(
  withAtmosphere(withHotkey(withStyles(styleThunk)(AgendaInputField))),
  graphql`
    fragment AgendaInputField_team on Team {
      teamId: id
      agendaItems {
        sortOrder
      }
    }`
);

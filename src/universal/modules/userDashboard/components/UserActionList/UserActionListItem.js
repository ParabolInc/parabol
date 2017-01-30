import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import OutcomeCardTextarea from 'universal/modules/outcomeCard/components/OutcomeCardTextarea/OutcomeCardTextarea';
import {Field} from 'redux-form';

class UserActionListItem extends Component {
  static propTypes = {
    actionId: PropTypes.string,
    content: PropTypes.string,
    dispatch: PropTypes.func,
    form: PropTypes.string,
    handleSubmit: PropTypes.func,
    handleActionUpdate: PropTypes.func,
    handleChecked: PropTypes.func,
    id: PropTypes.string,
    isActive: PropTypes.bool,
    isDragging: PropTypes.bool,
    isPreview: PropTypes.bool,
    onChecked: PropTypes.func,
    styles: PropTypes.object,
    team: PropTypes.string
  };

  shouldComponentUpdate(nextProps) {
    return Boolean(!nextProps.isPreview);
  }
  render() {
    const {
      actionId,
      handleActionUpdate,
      handleChecked,
      handleSubmit,
      isActive,
      isDragging,
      isPreview,
      styles,
      team
    } = this.props;
    const checkboxStyles = css(styles.checkbox, isActive && styles.checkboxDisabled);
    const rootStyles = css(
      styles.root,
      isDragging && styles.dragging
    );
    return (
      <div className={rootStyles} key={`action${actionId}`}>
        <form>
          <Field
            className={checkboxStyles}
            component="input"
            disabled={isActive}
            name={`complete${actionId}`}
            onClick={handleChecked}
            type="checkbox"
          />
          <Field
            name={actionId}
            component={OutcomeCardTextarea}
            doSubmitOnEnter
            handleSubmit={!isPreview && handleSubmit(handleActionUpdate)}
            isActionListItem
          />
        </form>
        <div className={css(styles.team)}>{team}</div>
      </div>
    );
  }
}

const basePadding = '.375rem';
const labelHeight = '1.5rem';
const styleThunk = () => ({
  root: {
    borderTop: `1px solid ${ui.cardBorderColor}`,
    position: 'relative',
    width: '100%'
  },

  checkbox: {
    cursor: 'pointer',
    left: basePadding,
    position: 'absolute',
    top: '.4375rem',
    zIndex: 200
  },

  dragging: {
    opacity: 0,
  },

  checkboxDisabled: {
    cursor: 'not-allowed'
  },

  team: {
    ...textOverflow,
    bottom: 0,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s1,
    fontWeight: 700,
    height: labelHeight,
    lineHeight: labelHeight,
    padding: `0 ${basePadding}`,
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    width: '100%',
    zIndex: 200
  }
});

export default
    withStyles(styleThunk)(
      UserActionListItem
);

import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import OutcomeCardTextarea from 'universal/components/OutcomeCard/OutcomeCardTextarea';
import {cashay} from 'cashay';
import {Field, reduxForm, initialize} from 'redux-form';

const combineStyles = StyleSheet.combineStyles;
const basePadding = '.375rem';
const labelHeight = '1.5rem';

let styles = {};

@reduxForm()
@look
export default class UserActionListItem extends Component {
  static propTypes = {
    content: PropTypes.string,
    id: PropTypes.string,
    isActive: PropTypes.bool,
    onChecked: PropTypes.func,
    team: PropTypes.string
  };

  componentWillMount() {
    const {content} = this.props;
    if (content) {
      this.initializeValues(content);
    }
  }
  componentWillReceiveProps(nextProps) {
    const {content} = this.props;
    const nextContent = nextProps.content;
    if (nextContent !== content) {
      this.initializeValues(nextContent);
    }
  }
  initializeValues(content) {
    const {dispatch, form, actionId} = this.props;
    dispatch(initialize(form, {[actionId]: content}));
  }
  handleActionUpdate = (submittedData) => {
    const {actionId} = this.props;
    const submittedContent = submittedData[actionId];
    if (!submittedContent) {
      // delete blank cards
      cashay.mutate('deleteAction', {variables: {actionId}});
    } else {
      // TODO debounce for useless things like ctrl, shift, etc
      const options = {
        variables: {
          updatedAction: {
            id: actionId,
            content: submittedContent
          }
        }
      };
      cashay.mutate('updateAction', options);
    }
  };
  handleChecked = () => {
    const {actionId} = this.props;
    const options = {
      variables: {
        updatedAction: {
          id: actionId,
          isComplete: true
        }
      }
    };
    cashay.mutate('updateAction', options);
  };

  render() {
    const {content, handleSubmit, actionId, isActive, team} = this.props;
    const checkboxStyles = isActive ? combineStyles(styles.checkbox, styles.checkboxDisabled) : styles.checkbox;
    return (
      <div className={styles.root} key={`action${actionId}`}>
        <form>
          <Field
            className={checkboxStyles}
            component="input"
            disabled={isActive}
            name={`complete${actionId}`}
            onClick={this.handleChecked}
            type="checkbox"
          />
          <Field
            name={actionId}
            component={OutcomeCardTextarea}
            doFocus={!content}
            handleSubmit={handleSubmit(this.handleActionUpdate)}
            isActionListItem
          />
        </form>
        <div className={styles.team}>{team}</div>
      </div>
    );
  }
};

styles = StyleSheet.create({
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

  checkboxDisabled: {
    cursor: 'not-allowed'
  },

  team: {
    ...textOverflow,
    bottom: 0,
    color: theme.palette.dark,
    fontSize: theme.typography.s1,
    fontWeight: 700,
    height: labelHeight,
    lineHeight: labelHeight,
    padding: `0 ${basePadding}`,
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    width: '100%', // TODO: @terry this is required to ensure the overflow works. please confirm & delete this note :-) MK
    zIndex: 200
  }
});

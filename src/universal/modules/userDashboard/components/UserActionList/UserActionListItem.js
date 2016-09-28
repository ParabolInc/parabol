import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import {reduxForm, Field} from 'redux-form';
import OutcomeCardTextarea from 'universal/components/OutcomeCard/OutcomeCardTextarea';
import {cashay} from 'cashay';

const combineStyles = StyleSheet.combineStyles;
const basePadding = '.375rem';
const labelHeight = '1.5rem';

const UserActionListItem = (props) => {
  const {styles} = UserActionListItem;
  const {content, form, handleSubmit, actionId, isEditing, onChecked, team} = props;
  const handleActionUpdate = (submittedData) => {
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
  const checkboxStyles = isEditing ? combineStyles(styles.checkbox, styles.checkboxDisabled) : styles.checkbox;
  return (
    <div className={styles.root} key={`action${actionId}`}>
      <input className={checkboxStyles} disabled={isEditing} onClick={onChecked} type="checkbox" />
      <form>
        <Field
          name={actionId}
          component={OutcomeCardTextarea}
          handleSubmit={handleSubmit(handleActionUpdate)}
          doFocus={!content}
        />
      </form>
      <div className={styles.team}>{team}</div>
    </div>
  );
};

UserActionListItem.propTypes = {
  content: PropTypes.string,
  id: PropTypes.string,
  isEditing: PropTypes.bool,
  onChecked: PropTypes.func,
  team: PropTypes.string
};

UserActionListItem.defaultProps = {
  isEditing: false,
  onChecked: () => console.log('UserActionListItem.checkbox.onChecked()'),
  team: 'Parabol'
};

UserActionListItem.styles = StyleSheet.create({
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

  // TODO: @terry can you merge this into OutcomeCardTextarea as a condition? MK
  content: {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    display: 'block',
    fontSize: theme.typography.s3,
    lineHeight: theme.typography.s5,
    outline: 'none',
    overflow: 'hidden',
    padding: `${basePadding} ${basePadding} ${labelHeight} 1.75rem`,
    resize: 'none',
    width: '100%',

    ':hover': {
      backgroundColor: ui.actionCardBgActive
    },
    ':focus': {
      backgroundColor: ui.actionCardBgActive
    }
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

export default reduxForm()(look(UserActionListItem));

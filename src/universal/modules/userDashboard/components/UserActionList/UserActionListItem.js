import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import Textarea from 'react-textarea-autosize';

const combineStyles = StyleSheet.combineStyles;
const basePadding = '.375rem';
const labelHeight = '1.5rem';

const UserActionListItem = (props) => {
  const {styles} = UserActionListItem;
  const {content, id, isEditing, onChecked, team, updatedAt} = props;
  const checkboxStyles = isEditing ? combineStyles(styles.checkbox, styles.checkboxDisabled) : styles.checkbox;
  return (
    <div className={styles.root} key={`action${id}`}>
      <input className={checkboxStyles} disabled={isEditing} onClick={onChecked} type="checkbox" />
      <Textarea className={styles.content} value={content} autoFocus={isEditing} />
      <div className={styles.team}>{team} • {updatedAt}</div>
    </div>
  );
};

UserActionListItem.propTypes = {
  content: PropTypes.string,
  id: PropTypes.string,
  isEditing: PropTypes.bool,
  onChecked: PropTypes.func,
  team: PropTypes.string,
  updatedAt: PropTypes.string
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
    zIndex: 200
  }
});

export default look(UserActionListItem);

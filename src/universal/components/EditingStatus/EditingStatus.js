import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import fromNow from 'universal/utils/fromNow';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';

const makeEditingStatus = (editors, isEditing, timestamp, timestampType) => {
  let editingStatus = null;
  // no one else is editing
  const timestampLabel = timestampType === 'createdAt' ? 'Created ' : 'Updated ';
  if (editors.length === 0) {
    editingStatus = isEditing ? <span>editing<Ellipsis /></span> : `${timestampLabel} ${fromNow(timestamp)}`;
  } else {
    const editorNames = editors.map((e) => e.teamMember.preferredName);
    // one other is editing
    if (editors.length === 1) {
      const editor = editorNames[0];
      editingStatus = <span>{editor} editing{isEditing ? ' too' : ''}<Ellipsis /></span>;
    } else if (editors.length === 2) {
      editingStatus = isEditing ?
        <span>several are editing<Ellipsis /></span> :
        <span>{`${editorNames[0]} and ${editorNames[1]} editing`}<Ellipsis /></span>;
    } else {
      editingStatus = <span>several are editing<Ellipsis /></span>;
    }
  }
  return editingStatus;
};

const EditingStatus = (props) => {
  const {editors, handleClick, isEditing, timestamp, timestampType, styles} = props;
  const title = isEditing ? 'editing…' : 'Tap to toggle Created/Updated';
  return (
    <div className={css(styles.timestamp)} onClick={handleClick} title={title}>
      {makeEditingStatus(editors, isEditing, timestamp, timestampType)}
    </div>
  );
};

EditingStatus.propTypes = {
  editors: PropTypes.array,
  handleClick: PropTypes.func,
  isEditing: PropTypes.bool,
  timestamp: PropTypes.instanceOf(Date),
  timestampType: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = (custom, {isEditing}) => ({
  timestamp: {
    color: appTheme.palette.dark80l,
    cursor: isEditing ? 'default' : 'pointer',
    fontSize: appTheme.typography.s2,
    fontWeight: 400,
    lineHeight: appTheme.typography.s4,
    padding: `.25rem ${ui.cardPaddingBase}`,
    textAlign: 'right'
  }
});

export default withStyles(styleThunk)(EditingStatus);

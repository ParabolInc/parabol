import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import fromNow from 'universal/utils/fromNow';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';

const makeEditingStatus = (editors, active, updatedAt) => {
  let editingStatus = null;
  // no one else is editing
  if (editors.length === 0) {
    editingStatus = active ? <span>editing<Ellipsis /></span> :
      fromNow(updatedAt);
  } else {
    const editorNames = editors.map((e) => e.teamMember.preferredName);
    // one other is editing
    if (editors.length === 1) {
      const editor = editorNames[0];
      editingStatus = <span>{editor} editing{active ? ' too' : ''}<Ellipsis /></span>;
    } else if (editors.length === 2) {
      editingStatus = active ?
        <span>several are editing<Ellipsis /></span> :
        <span>{`${editorNames[0]} and ${editorNames[1]} editing`}<Ellipsis /></span>;
    } else {
      editingStatus = <span>several are editing<Ellipsis /></span>;
    }
  }
  return editingStatus;
};

const EditingStatus = (props) => {
  const {editors, active, updatedAt, styles} = props;
  return <div className={css(styles.timestamp)}>{makeEditingStatus(editors, active, updatedAt)}</div>;
};

EditingStatus.propTypes = {
  editors: PropTypes.array,
  active: PropTypes.bool,
  updatedAt: PropTypes.instanceOf(Date),
  styles: PropTypes.object
};

const styleThunk = () => ({
  timestamp: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s1,
    fontWeight: 700,
    lineHeight: appTheme.typography.s3,
    padding: `.25rem ${ui.cardPaddingBase}`,
    textAlign: 'right'
  }
});

export default withStyles(styleThunk)(EditingStatus);

import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import fromNow from 'universal/utils/fromNow';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const makeEditingStatus = (editors, isEditing, timestamp, timestampType) => {
  let editingStatus = null;
  const timestampLabel = timestampType === 'createdAt' ? 'Created ' : 'Updated ';

  if (editors.length === 0) {
    editingStatus = isEditing ? <span>{'Editing'}<Ellipsis /></span> : `${timestampLabel} ${fromNow(timestamp)}`;
  } else {
    const editorNames = editors.map((editor) => editor.preferredName);
    // one other is editing
    if (editors.length === 1) {
      const editor = editorNames[0];
      editingStatus = <span>{editor}{' editing'}{isEditing ? ' too' : ''}<Ellipsis /></span>;
    } else if (editors.length === 2) {
      editingStatus = isEditing ?
        <span>several are editing<Ellipsis /></span> :
        <span>{`${editorNames[0]} and ${editorNames[1]} editing`}<Ellipsis /></span>;
    } else {
      editingStatus = <span>{'Several are editing'}<Ellipsis /></span>;
    }
  }
  return editingStatus;
};

const EditingStatus = (props) => {
  const {atmosphere: {userId: myUserId}, handleClick, project: {editors}, timestamp, timestampType, styles} = props;
  const otherEditors = editors.filter((editor) => editor.userId !== myUserId);
  const isEditing = editors.length > otherEditors.length;
  const title = isEditing ? 'Editing…' : 'Tap to toggle Created/Updated';
  return (
    <div className={css(styles.timestamp)} onClick={handleClick} title={title}>
      {makeEditingStatus(otherEditors, isEditing, timestamp, timestampType)}
    </div>
  );
};

EditingStatus.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  handleClick: PropTypes.func,
  project: PropTypes.object.isRequired,
  timestamp: PropTypes.string.isRequired,
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

export default createFragmentContainer(
  withAtmosphere(withStyles(styleThunk)(EditingStatus)),
  graphql`
    fragment EditingStatus_project on Project {
      editors {
        userId
        preferredName
      }
    }`
);

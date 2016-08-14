import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

const {combineStyles} = StyleSheet;
const descriptionFA = {
  backgroundColor: theme.palette.cool10l,
  borderTopColor: 'currentColor',
  color: theme.palette.cool,
  outline: 'none'
};
const descriptionActionFA = {
  backgroundColor: 'rgba(255, 255, 255, .85)',
  borderTopColor: theme.palette.mid,
  color: theme.palette.mid10d
};

function editingStatus(iAmActive, myId, allIds, teamMembers, timestamp) {
  const everybodyElse = allIds.filter((id) => id !== myId);

  if (iAmActive && everybodyElse.length === 0) {
    // we're editing all by ourselves
    return 'editing...';
  } else if (everybodyElse.length === 1) {
    const otherEditor = teamMembers.find((m) => m.id === everybodyElse[0]);
    if (iAmActive) {
      // we're editing with one other
      return `${otherEditor.preferredName} editing too...`;
    }
    // one other person is editing alone
    return `${otherEditor.preferredName} editing...`;
  } else if (everybodyElse.length > 1) {
    if (iAmActive || everybodyElse.length > 2) {
      // busy!
      return 'several are editing...';
    }
    // two folks are editing
    const editorA = teamMembers.find((m) => m.id === everybodyElse[0]);
    const editorB = teamMembers.find((m) => m.id === everybodyElse[1]);
    return `${editorA.preferredName} &amp; ${editorB.preferredName} editing...`;
  }
  return timestamp;
}

const OutcomeCardTextAreaField = (field) => {
  const {styles} = OutcomeCardTextAreaField;
  const {
    input,
    isProject,
    editingBy,
    teamMemberId,
    teamMembers,
    handleActive,
    handleSubmit,
    timestamp,
    meta: {active}
  } = field;
  const descStyles = isProject ? styles.content : combineStyles(styles.content, styles.descriptionAction);
  const allClassNames = combineStyles(descStyles, 'mousetrap');
  if (handleActive) {
    handleActive(active);
  }
  const handleBlur = () => {
    handleSubmit();
    input.onBlur();
  };
  let textAreaRef;
  const setRef = (c) => { textAreaRef = c; };
  const handleKeyUp = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      handleBlur();
      textAreaRef.blur();
    }
  };
  return (
    <div>
      <div className={styles.timestamp}>
        {editingStatus(active, teamMemberId, editingBy, teamMembers, timestamp)}
      </div>
      <textarea
        ref={setRef}
        className={allClassNames}
        placeholder="Type your project outcome here"
        onBlur={handleBlur}
        onKeyDown={handleKeyUp}
        {...field.input}
      />
    </div>
  );
};

OutcomeCardTextAreaField.propTypes = {
  input: PropTypes.object,
  isProject: PropTypes.bool,
  teamMemberId: PropTypes.string,
  teamMembers: PropTypes.array,
  handleActive: PropTypes.func,
  handleSubmit: PropTypes.func,
  timestamp: PropTypes.string,
  meta: PropTypes.shape({
    active: PropTypes.bool
  })
};

OutcomeCardTextAreaField.styles = StyleSheet.create({
  content: {
    backgroundColor: 'transparent',
    border: 0,
    borderTop: '1px solid transparent',
    color: theme.palette.dark10d,
    display: 'block',
    fontFamily: theme.typography.sansSerif,
    fontSize: theme.typography.s3,
    lineHeight: theme.typography.s4,
    // TODO: Clean up these comments (TA)
    // minHeight: '2.6875rem', // A
    // minHeight: '2.1875rem', // B
    minHeight: '3.3125rem', // Oversizing for menu (TA)
    padding: '.5rem .5rem 1rem', // A
    // padding: '.5rem', // B
    resize: 'none',
    width: '100%',

    ':focus': {
      ...descriptionFA
    },
    ':active': {
      ...descriptionFA
    }
  },
  descriptionAction: {
    // NOTE: modifies styles.content
    ':focus': {
      ...descriptionActionFA
    },
    ':active': {
      ...descriptionActionFA
    }
  },
  timestamp: {
    color: theme.palette.dark,
    fontSize: theme.typography.s1,
    fontWeight: 700,
    lineHeight: theme.typography.s3,
    padding: '.5rem',
    textAlign: 'right'
  },
});

export default look(OutcomeCardTextAreaField);

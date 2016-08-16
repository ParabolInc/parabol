import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';

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

function editingStatus(iAmActive, myTeamMemberId, editingUserIds, teamMembers, timestamp) {
  const [userId, teamId] = myTeamMemberId.split('::');
  const everybodyElse = editingUserIds
                          .filter((id) => id !== userId)
                          .map(id => [id, teamId].join('::'));

  if (iAmActive && everybodyElse.length === 0) {
    // we're editing all by ourselves
    return <span>editing<Ellipsis/></span>;
  } else if (everybodyElse.length === 1) {
    const otherEditor = teamMembers.find((m) => m.id === everybodyElse[0]);
    if (iAmActive) {
      // we're editing with one other
      return <span>{otherEditor.preferredName} editing too<Ellipsis/></span>;
    }
    // one other person is editing alone
    return <span>{otherEditor.preferredName} editing<Ellipsis/></span>;
  } else if (everybodyElse.length > 1) {
    if (iAmActive || everybodyElse.length > 2) {
      // busy!
      return <span>several are editing<Ellipsis/></span>;
    }
    // two folks are editing
    const editorA = teamMembers.find((m) => m.id === everybodyElse[0]);
    const editorB = teamMembers.find((m) => m.id === everybodyElse[1]);
    return <span>{editorA.preferredName} &amp;{editorB.preferredName} editing<Ellipsis/></span>;
  }
  return timestamp;
}

let styles = {};

@look
export default class OutcomeCardTextAreaField extends Component {
  static propTypes = {
    editingMe: PropTypes.array.isRequired,
    handleActive: PropTypes.func,
    handleSubmit: PropTypes.func,
    input: PropTypes.object,
    isProject: PropTypes.bool,
    teamMemberId: PropTypes.string,
    teamMembers: PropTypes.array,
    timestamp: PropTypes.string,
    meta: PropTypes.shape({
      active: PropTypes.bool
    }),
    showByTeam: PropTypes.bool
  };

  componentWillReceiveProps(nextProps) {
    const {meta: {active}} = this.props;
    const {handleActive, meta: {active: nextActive}} = nextProps;
    if (active !== nextActive && handleActive) {
      handleActive(nextActive);
    }
  }

  render() {
    const {
      editingMe,
      handleSubmit,
      input,
      isProject,
      meta: {active},
      showByTeam,
      teamMemberId,
      teamMembers,
      timestamp
    } = this.props;
    const descStyles = isProject ? styles.content : combineStyles(styles.content, styles.descriptionAction);
    const allClassNames = combineStyles(descStyles, 'mousetrap');
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
          {!showByTeam && editingStatus(active, teamMemberId, editingMe, teamMembers, timestamp)}
        </div>
        <textarea
          {...input}
          ref={setRef}
          className={allClassNames}
          placeholder="Type your project outcome here"
          onBlur={handleBlur}
          onKeyDown={handleKeyUp}
        />
      </div>
    );
  }
}

styles = StyleSheet.create({
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

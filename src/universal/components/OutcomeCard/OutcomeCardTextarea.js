import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';

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

function editingStatus(iAmActive, editors, timestamp) {
  // TODO cache a string instead of array of editors
  // no one else is editing
  if (editors.length === 0) {
    return iAmActive ? <span>editing<Ellipsis/></span> : timestamp;
  }
  // one other is editing
  if (editors.length === 1) {
    const editor = editors[0];
    return iAmActive ?
      <span>{editor} editing too<Ellipsis/></span> :
      <span>{editor} editing<Ellipsis/></span>;
  }
  if (editors.length === 2) {
    return iAmActive ?
      <span>several are editing<Ellipsis/></span> :
      <span>{`${editors[0]} and ${editors[1]} editing`}<Ellipsis/></span>;
  }
  return <span>several are editing<Ellipsis/></span>;
}

let styles = {};

@look
export default class OutcomeCardTextAreaField extends Component {
  static propTypes = {
    doFocus: PropTypes.bool,
    editors: PropTypes.array,
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
      editors,
      handleSubmit,
      input,
      meta: {active},
      timestamp,
      doFocus
    } = this.props;
    const descStyles = styles.content;
    const handleBlur = () => {
      handleSubmit();
      input.onBlur();
    };
    let textAreaRef;
    const setRef = (c) => {
      textAreaRef = c;
    };
    const handleKeyUp = (e) => {
      if (e.keyCode === 13 && !e.shiftKey) {
        handleBlur();
        textAreaRef.blur();
      }
    };

    return (
      <div>
        <div className={styles.timestamp}>
          {editingStatus(active, editors, timestamp)}
        </div>
        <textarea
          {...input}
          ref={setRef}
          className={descStyles}
          placeholder="Type your project outcome here"
          onBlur={handleBlur}
          onKeyDown={handleKeyUp}
          autoFocus={doFocus}
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

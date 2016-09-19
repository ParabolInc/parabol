import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const combineStyles = StyleSheet.combineStyles;

const descriptionFA = {
  backgroundColor: theme.palette.mid10l,
  borderBottomColor: theme.palette.mid,
  color: theme.palette.mid10d,
  outline: 'none'
};

const descriptionActionFA = {
  backgroundColor: 'rgba(255, 255, 255, .85)',
  borderBottomColor: theme.palette.mid,
  color: theme.palette.mid10d
};

let styles = {};

@look
export default class OutcomeCardTextArea extends Component {
  static propTypes = {
    cardHasHover: PropTypes.bool,
    doFocus: PropTypes.bool,
    editingStatus: PropTypes.any,
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
      cardHasHover,
      editingStatus,
      handleSubmit,
      input,
      doFocus
    } = this.props;
    const contentStyleWhenCardHovered = combineStyles(styles.content, styles.contentWhenCardHovered);
    const descStyles = cardHasHover ? contentStyleWhenCardHovered : styles.content;
    const handleBlur = () => {
      handleSubmit();
      input.onBlur();
    };
    let textAreaRef;
    const setRef = (c) => {
      textAreaRef = c;
    };
    const handleKeyUp = (e) => {
      // hitting enter (not shift+enter) submits the textarea
      if (e.keyCode === 13 && !e.shiftKey) {
        handleBlur();
        textAreaRef.blur();
      }
    };

    return (
      <div>
        <div className={styles.timestamp}>
          {editingStatus}
        </div>
        <textarea
          {...input}
          ref={setRef}
          className={descStyles}
          placeholder="Type your outcome here"
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
    borderBottom: '1px solid transparent',
    color: theme.palette.dark10d,
    display: 'block',
    fontFamily: theme.typography.sansSerif,
    fontSize: theme.typography.sBase,
    lineHeight: theme.typography.s6,
    // minHeight: '3.3125rem',
    padding: `0 ${ui.cardPaddingBase} .25rem`,
    resize: 'none',
    width: '100%',

    ':focus': {
      ...descriptionFA
    },
    ':active': {
      ...descriptionFA
    }
  },

  contentWhenCardHovered: {
    ...descriptionFA
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
    padding: `.25rem ${ui.cardPaddingBase}`,
    textAlign: 'right'
  }
});

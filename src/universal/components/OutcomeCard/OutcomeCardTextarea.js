import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import Textarea from 'react-textarea-autosize';

const combineStyles = StyleSheet.combineStyles;

const descriptionBase = {
  backgroundColor: 'transparent',
  border: 0,
  borderBottom: '1px solid transparent',
  borderTop: '1px solid transparent',
  color: theme.palette.dark10d,
  outline: 'none'
};

const descriptionFA = {
  backgroundColor: theme.palette.mid10l,
  borderBottomColor: ui.cardBorderColor,
  borderTopColor: ui.cardBorderColor,
  color: theme.palette.mid10d
};

const descriptionActionFA = {
  backgroundColor: ui.actionCardBgActive,
  borderBottomColor: ui.cardBorderColor,
  borderTopColor: ui.cardBorderColor,
  color: theme.palette.mid10d
};

const descriptionBreakpoint = '@media (min-width: 90rem)';

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
    isArchived: PropTypes.bool,
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
      handleSubmit,
      input,
      isArchived,
      isProject,
      doFocus
    } = this.props;
    let contentStyles = styles.content;
    let textAreaRef;

    const contentStyleWhenCardHovered = combineStyles(styles.content, styles.contentWhenCardHovered);
    const actionContentStyleWhenCardHovered = combineStyles(
      styles.content,
      styles.descriptionAction,
      styles.actionContentWhenCardHovered
    );
    const handleBlur = () => {
      handleSubmit();
      input.onBlur();
    };
    const handleKeyPress = () => {
      // TODO fix me there's a little lag here
      // handleSubmit();
    };
    const setRef = (c) => {
      textAreaRef = c;
    };
    const submitOnEnter = (e) => {
      // hitting enter (not shift+enter) submits the textarea
      if (e.keyCode === 13 && !e.shiftKey) {
        handleBlur();
        textAreaRef.blur();
      }
    };

    if (isProject) {
      contentStyles = cardHasHover ? contentStyleWhenCardHovered : styles.content;
    } else {
      contentStyles = cardHasHover ?
        actionContentStyleWhenCardHovered :
        combineStyles(styles.content, styles.descriptionAction);
    }

    if (isArchived) {
      contentStyles = combineStyles(styles.content, styles.isArchived);
    }

    return (
      <Textarea
        {...input}
        ref={setRef}
        className={contentStyles}
        disabled={isArchived}
        placeholder="Type your outcome here"
        onBlur={handleBlur}
        onKeyDown={submitOnEnter}
        onKeyUp={handleKeyPress}
        autoFocus={doFocus}
      />
    );
  }
}

styles = StyleSheet.create({
  content: {
    ...descriptionBase,
    display: 'block',
    fontFamily: theme.typography.sansSerif,
    fontSize: theme.typography.s3,
    lineHeight: theme.typography.s5,
    minHeight: '3.3125rem',
    padding: `0 ${ui.cardPaddingBase} .1875rem`,
    resize: 'none',
    width: '100%',

    ':focus': {
      ...descriptionFA
    },
    ':active': {
      ...descriptionFA
    },

    [descriptionBreakpoint]: {
      fontSize: theme.typography.sBase,
      lineHeight: theme.typography.s6
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

  actionContentWhenCardHovered: {
    ...descriptionActionFA
  },

  isArchived: {
    cursor: 'not-allowed',

    ':focus': {
      ...descriptionBase
    },
    ':active': {
      ...descriptionBase
    }
  }
});

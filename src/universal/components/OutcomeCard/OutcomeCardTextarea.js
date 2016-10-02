import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Textarea from 'react-textarea-autosize';

class OutcomeCardTextArea extends Component {
  static propTypes = {
    cardHasHover: PropTypes.bool,
    doFocus: PropTypes.bool,
    editingStatus: PropTypes.any,
    handleActive: PropTypes.func,
    handleSubmit: PropTypes.func,
    input: PropTypes.object,
    isActionListItem: PropTypes.bool,
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
      isActionListItem,
      isArchived,
      isProject,
      doFocus,
      styles,
    } = this.props;

    const contentStyles = css(
      !isActionListItem && styles.content,
      isActionListItem && styles.actionListContent,
      isProject && cardHasHover && styles.contentWhenCardHovered,
      isArchived && styles.isArchived,
      !isProject && cardHasHover && styles.actionContentWhenCardHovered,
      !isProject && styles.descriptionAction
    );

    let textAreaRef;
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

const basePadding = '.375rem';
const labelHeight = '1.5rem';

const baseStyles = {
  backgroundColor: 'transparent',
  border: 0,
  boxShadow: 'none',
  display: 'block',
  fontFamily: appTheme.typography.sansSerif,
  fontSize: appTheme.typography.s3,
  lineHeight: appTheme.typography.s5,
  outline: 'none',
  resize: 'none',
  width: '100%'
};

const descriptionBase = {
  ...baseStyles,
  borderBottom: '1px solid transparent',
  borderTop: '1px solid transparent',
  color: appTheme.palette.dark10d
};

const descriptionFA = {
  backgroundColor: appTheme.palette.mid10l,
  borderBottomColor: ui.cardBorderColor,
  borderTopColor: ui.cardBorderColor,
  color: appTheme.palette.mid10d
};

const descriptionActionFA = {
  backgroundColor: ui.actionCardBgActive,
  borderBottomColor: ui.cardBorderColor,
  borderTopColor: ui.cardBorderColor,
  color: appTheme.palette.mid10d
};

const descriptionBreakpoint = '@media (min-width: 90rem)';

const styleThunk = () => ({
  actionListContent: {
    ...baseStyles,
    padding: `${basePadding} ${basePadding} ${labelHeight} 1.75rem`,

    ':hover': {
      backgroundColor: ui.actionCardBgActive
    },
    ':focus': {
      backgroundColor: ui.actionCardBgActive
    }
  },
  content: {
    ...descriptionBase,
    minHeight: '3.3125rem',
    padding: `0 ${ui.cardPaddingBase} .1875rem`,

    ':focus': {
      ...descriptionFA
    },
    ':active': {
      ...descriptionFA
    },

    [descriptionBreakpoint]: {
      fontSize: appTheme.typography.sBase,
      lineHeight: appTheme.typography.s6
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

export default withStyles(styleThunk)(OutcomeCardTextArea);

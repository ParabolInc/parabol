import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import Textarea from 'react-textarea-autosize';

const combineStyles = StyleSheet.combineStyles;
const basePadding = '.375rem';
const labelHeight = '1.5rem';

const baseStyles = {
  backgroundColor: 'transparent',
  border: 0,
  boxShadow: 'none',
  display: 'block',
  fontFamily: theme.typography.sansSerif,
  fontSize: theme.typography.s3,
  lineHeight: theme.typography.s5,
  outline: 'none',
  resize: 'none',
  width: '100%'
};

const descriptionBase = {
  ...baseStyles,
  borderBottom: '1px solid transparent',
  borderTop: '1px solid transparent',
  color: theme.palette.dark10d
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
      isActionListItem,
      isArchived,
      isProject,
      doFocus
    } = this.props;

    const contentStylesObj = {
      [styles.content]: !isActionListItem,
      [styles.actionListContent]: isActionListItem,
      [styles.contentWhenCardHovered]: isProject && cardHasHover,
      [styles.isArchived]: isArchived,
      [styles.actionContentWhenCardHovered]: !isProject && cardHasHover,
      [styles.descriptionAction]: !isProject
    };
    const contentStylesArr = Object.keys(contentStylesObj).filter(style => contentStylesObj[style]);
    const contentStyles = combineStyles(...contentStylesArr);
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

styles = StyleSheet.create({
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

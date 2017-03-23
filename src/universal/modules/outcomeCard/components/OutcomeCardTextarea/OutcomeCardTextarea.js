import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Textarea from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import markdownCustomComponents from 'universal/utils/markdownCustomComponents';


class OutcomeCardTextArea extends Component {
  static propTypes = {
    cardHasHover: PropTypes.bool,
    doSubmitOnEnter: PropTypes.bool,
    editingStatus: PropTypes.any,
    handleActive: PropTypes.func,
    handleSubmit: PropTypes.func,
    input: PropTypes.object,
    isActionListItem: PropTypes.bool,
    isArchived: PropTypes.bool,
    isProject: PropTypes.bool,
    meta: PropTypes.shape({
      active: PropTypes.bool
    }),
    styles: PropTypes.object,
    teamMemberId: PropTypes.string,
    teamMembers: PropTypes.array,
    timestamp: PropTypes.string,
  };

  constructor(props) {
    super(props);
    const {input: {value}} = this.props;
    this.state = {
      isEditing: !value
    };
  }

  componentWillReceiveProps(nextProps) {
    const {meta: {active}} = this.props;
    const {handleActive, meta: {active: nextActive}} = nextProps;
    if (active !== nextActive && handleActive) {
      handleActive(nextActive);
    }
  }

  setEditing = () => {
    this.setState({isEditing: true});
  };

  unsetEditing = () => {
    this.setState({isEditing: false});
  }

  renderEditing() {
    const {
      doSubmitOnEnter,
      handleSubmit,
      input,
      isProject,
      isActionListItem,
      isArchived,
      styles
    } = this.props;
    const contentStyles = css(
      !isActionListItem && styles.content,
      isActionListItem && styles.actionListContent,
      isArchived && styles.isArchived,
      !isProject && styles.descriptionAction
    );

    const handleBlur = () => {
      if (input.value) {
        // if there's no value, then the document event listener will handle this
        input.onBlur();
        this.unsetEditing();
        handleSubmit();
      }
    };
    let textAreaRef;
    const setRef = (c) => {
      textAreaRef = c;
    };

    const submitOnEnter = (e) => {
       // hitting enter (not shift+enter or any wacky combo) submits the textarea
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        textAreaRef.blur();
      }
    };

    return (
      <Textarea
        {...input}
        ref={setRef}
        defaultValue={input.value}
        value={undefined}
        className={contentStyles}
        disabled={isArchived}
        maxLength="255"
        placeholder="Type your outcome here"
        onBlur={handleBlur}
        onDrop={null}
        onKeyDown={doSubmitOnEnter ? submitOnEnter : null}
        autoFocus
      />
    );
  }

  renderMarkdown() {
    const {
      styles,
      cardHasHover,
      isProject,
      isActionListItem,
      isArchived,
      input: {value}
    } = this.props;
    const markdownStyles = css(
      styles.markdown,
      !isActionListItem && styles.content,
      isActionListItem && styles.actionListContent,
      isProject && !isArchived && cardHasHover && styles.contentWhenCardHovered,
      !isProject && cardHasHover && styles.actionContentWhenCardHovered,
      !isProject && styles.descriptionAction
    );
    return (
      <div
        onClick={!isArchived && this.setEditing}
        className={markdownStyles}
      >
        <ReactMarkdown
          renderers={markdownCustomComponents}
          source={value}
          escapeHtml
          softBreak="br"
        />
      </div>
    );
  }

  render() {
    const {input: {value}} = this.props;
    return (
      <div>
        {(value && !this.state.isEditing) ? this.renderMarkdown() :
          this.renderEditing()}
      </div>
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

  isArchived: {
    cursor: 'not-allowed',

    ':focus': {
      backgroundColor: 'transparent',
      borderColor: 'transparent'
    },
    ':active': {
      backgroundColor: 'transparent',
      borderColor: 'transparent'
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

  markdown: {
    wordBreak: 'break-word'
  }
});

export default withStyles(styleThunk)(OutcomeCardTextArea);

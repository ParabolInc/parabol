import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Textarea from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import ANewTab from 'universal/components/ANewTab/ANewTab';

class OutcomeCardTextArea extends Component {
  static propTypes = {
    cardHasHover: PropTypes.bool,
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
      handleSubmit,
      input,
      isActionListItem,
      isArchived,
      styles
    } = this.props;
    const contentStyles = css(
      !isActionListItem && styles.content,
      isActionListItem && styles.actionListContent,
      isArchived && styles.isArchived,
    );

    let textAreaRef;
    const handleBlur = () => {
      const {input: {value}} = this.props;
      if (value) {
        // if there's no value, then the document event listener will handle this
        input.onBlur();
        this.unsetEditing();
        handleSubmit();
      }
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
      if (e.key === 'Enter' && !e.shiftKey) {
        textAreaRef.blur();
        this.unsetEditing();
      }
    };
    const shouldAutoFocus = true;
    return (
      <Textarea
        {...input}
        ref={setRef}
        className={contentStyles}
        disabled={isArchived}
        maxLength="255"
        placeholder="Type your outcome here"
        onBlur={handleBlur}
        onDrop={null}
        onKeyDown={submitOnEnter}
        onKeyUp={handleKeyPress}
        autoFocus={shouldAutoFocus}
      />
    );
  }

  renderMarkdown() {
    const {
      styles,
      isArchived,
      input: {value}
    } = this.props;
    const markdownStyles = css(styles.markdownContent);
    const markdownCustomComponents = {
      Link: ANewTab
    };

    return (
      <div
        onClick={!isArchived && this.setEditing}
        className={markdownStyles}
      >
        <ReactMarkdown
          renderers={markdownCustomComponents}
          source={value}
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

  markdownContent: {
    ...baseStyles,
    padding: `${basePadding} ${basePadding} ${labelHeight} ${basePadding}`,
    ':hover': {
      ...descriptionFA
    },
    ':focus': {
      ...descriptionFA
    },
    wordBreak: 'break-word'
  }
});

export default withStyles(styleThunk)(OutcomeCardTextArea);

import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {PROJECT_MAX_CHARS, tags} from 'universal/utils/constants';
import {MentionWrapper, MentionMenu} from 'react-githubish-mentions';
import MentionTeamMember from '../../../../components/MentionTeamMember/MentionTeamMember';
import MentionTag from '../../../../components/MentionTag/MentionTag';
import Markdown from '../../../../components/Markdown/Markdown';

let textAreaRef;
class OutcomeCardTextArea extends Component {
  static propTypes = {
    cardHasHover: PropTypes.bool,
    doSubmitOnEnter: PropTypes.bool,
    editingStatus: PropTypes.any,
    handleActive: PropTypes.func,
    handleSubmit: PropTypes.func,
    input: PropTypes.object,
    isArchived: PropTypes.bool,
    isPrivate: PropTypes.bool,
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
      isArchived,
      isPrivate,
      styles
    } = this.props;
    const contentStyles = css(
      styles.content,
      isPrivate && styles.contentPrivate,
      isArchived && styles.isArchived,
    );

    const handleBlur = () => {
      if (input.value) {
        // if there's no value, then the document event listener will handle this
        input.onBlur();
        this.unsetEditing();
        handleSubmit();
      }
    };

    const setRef = (c) => {
      textAreaRef = c;
    };

    const submitOnEnter = (e) => {
       // hitting enter (not shift+enter or any wacky combo) submits the textarea
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        textAreaRef.blur();
      }
    };

    const atQuery = async (query) => {
      const {teamMembers} = this.props;
      const matchingMembers = teamMembers.filter((member) => member.preferredName.startsWith(query));
      return matchingMembers.map((member) => ({...member, value: member.preferredName}));
    };

    const tagQuery = async (query) => {
      return tags.filter((tag) => tag.value.startsWith(query));
    };

    const mentionMenuStyle = css(styles.mentionMenu);
    return (
      <MentionWrapper
        {...input}
        getRef={setRef}
        className={contentStyles}
        disabled={isArchived}
        maxLength={PROJECT_MAX_CHARS}
        placeholder="Type your outcome here"
        onBlur={handleBlur}
        onDrop={null}
        onKeyDown={doSubmitOnEnter ? submitOnEnter : null}
        autoFocus
      >
        <MentionMenu className={mentionMenuStyle} trigger="@" item={MentionTeamMember} resolve={atQuery} />
        <MentionMenu className={mentionMenuStyle} trigger="#" item={MentionTag} resolve={tagQuery} />
      </MentionWrapper>

    );
  }

  renderMarkdown() {
    const {
      styles,
      cardHasHover,
      isArchived,
      isPrivate,
      input: {value}
    } = this.props;
    const markdownStyles = css(
      styles.markdown,
      styles.content,
      isPrivate && styles.contentPrivate,
      !isArchived && cardHasHover && (isPrivate ? styles.privateContentOnHover : styles.contentOnHover),
      isArchived && styles.isArchived
    );
    return (
      <div
        onClick={!isArchived && this.setEditing}
        className={markdownStyles}
      >
        <Markdown source={value} />
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

// const basePadding = '.375rem';
// const labelHeight = '1.5rem';

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

const contentBase = {
  ...baseStyles,
  borderBottom: '1px solid transparent',
  borderTop: '1px solid transparent',
  color: appTheme.palette.dark10d
};

const contentFA = {
  backgroundColor: appTheme.palette.mid10l,
  borderBottomColor: ui.cardBorderColor,
  borderTopColor: ui.cardBorderColor,
  color: appTheme.palette.mid10d
};

const contentPrivateFA = {
  backgroundColor: ui.privateCardBgActive,
  borderBottomColor: ui.cardBorderColor,
  borderTopColor: ui.cardBorderColor,
  color: appTheme.palette.mid10d
};

const descriptionBreakpoint = '@media (min-width: 90rem)';

const styleThunk = () => ({
  content: {
    ...contentBase,
    // TODO: only set this during the agenda round to match the card placeholder row height?
    // minHeight: '3.3125rem',
    padding: `0 ${ui.cardPaddingBase} .1875rem`,

    ':focus': {
      ...contentFA
    },
    ':active': {
      ...contentFA
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

  contentOnHover: {
    ...contentFA
  },

  contentPrivate: {
    // NOTE: modifies styles.content
    ':focus': {
      ...contentPrivateFA
    },
    ':active': {
      ...contentPrivateFA
    }
  },

  privateContentOnHover: {
    ...contentPrivateFA
  },

  markdown: {
    wordBreak: 'break-word'
  },

  mentionMenu: {
    background: '#fff',
    border: `1px solid ${ui.cardBorderCoor}`,
    borderRadius: ui.borderRadiusSmall,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    padding: ui.borderRadiusSmall,
  }
});

export default withStyles(styleThunk)(OutcomeCardTextArea);

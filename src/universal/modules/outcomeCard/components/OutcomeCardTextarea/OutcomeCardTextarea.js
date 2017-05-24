import createEmojiPlugin from 'draft-js-emoji-plugin';
import Editor from 'draft-js-plugins-editor';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
// import MentionTeamMember from '../../../../components/MentionTeamMember/MentionTeamMember';
import 'draft-js-emoji-plugin/lib/plugin.css';
import 'draft-js-linkify-plugin/lib/plugin.css';
import createLinkifyPlugin from 'draft-js-linkify-plugin';

class OutcomeCardTextArea extends Component {
  static propTypes = {
    cardHasHover: PropTypes.bool,
    content: PropTypes.string,
    handleCardUpdate: PropTypes.func,
    isArchived: PropTypes.bool,
    isEditing: PropTypes.bool,
    isPrivate: PropTypes.bool,
    name: PropTypes.string,
    setEditing: PropTypes.func,
    setValue: PropTypes.func,
    styles: PropTypes.object,
    teamMembers: PropTypes.array,
    textAreaValue: PropTypes.object,
    unsetEditing: PropTypes.func
  };

  constructor(props) {
    super(props);
    const emojiPlugin = createEmojiPlugin();
    const linkifyPlugin = createLinkifyPlugin();
    this.plugins = [
      emojiPlugin,
      linkifyPlugin
    ];
    this.EmojiSuggestions = emojiPlugin.EmojiSuggestions;

  }

  componentWillReceiveProps(nextProps) {
    //if (nextProps.textAreaValue !== this.props.textAreaValue) {
      //this.emojiPlugin = createEmojiPlugin();
      //this.EmojiSuggestions = this.emojiPlugin.EmojiSuggestions;
      //this.plugins = [this.emojiPlugin];
    //}
    //this.emojiPlugin = createEmojiPlugin();
    //this.EmojiSuggestions = this.emojiPlugin.EmojiSuggestions;
  }

  //submitOnEnter = (e) => {
  //  // hitting enter (not shift+enter or any wacky combo) submits the textarea
  //  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
  //    this.textAreaRef.blur();
  //    const {handleCardUpdate, unsetEditing} = this.props;
  //    handleCardUpdate();
  //    unsetEditing();
  //    e.preventDefault();
  //  }
  //};
  //
  //handleChange = (e, newVal) => {
  //  const {setValue} = this.props;
  //  const value = e.target.value || newVal;
  //  setValue(value);
  //};

  //renderEditing() {
  //  const {
  //    handleCardUpdate,
  //    isArchived,
  //    isPrivate,
  //    styles,
  //    textAreaValue
  //  } = this.props;
  //  const contentStyles = css(
  //    styles.content,
  //    isPrivate && styles.contentPrivate,
  //    isArchived && styles.isArchived
  //  );
  //
  //  const setRef = (c) => {
  //    this.textAreaRef = c;
  //  };
  //
  //  // const atQuery = async (query) => {
  //  //   const {teamMembers} = this.props;
  //  //   const matchingMembers = teamMembers.filter((member) => member.preferredName.startsWith(query));
  //  //   return matchingMembers.map((member) => ({...member, value: member.preferredName}));
  //  // };
  //
  //  const tagQuery = async (query) => {
  //    return tags.filter((tag) => tag.value.startsWith(query));
  //  };
  //
  //  const emojiQuery = async (query) => {
  //    if (!query) {
  //      return emojiArray.slice(2, 8);
  //    }
  //    return emojiArray.map((obj) => ({
  //      ...obj,
  //      score: stringScore(obj.value, query)
  //    }))
  //      .sort((a, b) => a.score < b.score ? 1 : -1)
  //      .slice(0, 6)
  //      // ":place of worship:" shouldn't pop up when i type ":poop"
  //      .filter((obj, idx, arr) => obj.score > 0 && arr[0].score - obj.score < 0.3);
  //  };
  //
  //  const emojiReplace = (userObj) => `${userObj.emoji} `;
  //
  //  const mentionMenuStyle = css(styles.mentionMenu);
  //  return (
  //    <MentionWrapper
  //      getRef={setRef}
  //      className={contentStyles}
  //      disabled={isArchived}
  //      maxLength={PROJECT_MAX_CHARS}
  //      placeholder="Type your outcome here"
  //      onBlur={handleCardUpdate}
  //      onChange={this.handleChange}
  //      onDrop={null}
  //      onKeyDown={this.submitOnEnter}
  //      autoFocus
  //      value={textAreaValue || ''}
  //      rows={3}
  //    >
  //      {/* <MentionMenu className={mentionMenuStyle} trigger="@" item={MentionTeamMember} resolve={atQuery} />*/}
  //      <MentionMenu className={mentionMenuStyle} trigger="#" item={MentionTag} resolve={tagQuery}/>
  //      <MentionMenu className={mentionMenuStyle} trigger=":" item={MentionEmoji} resolve={emojiQuery}
  //                   replace={emojiReplace}/>
  //    </MentionWrapper>
  //
  //  );
  //}

  //renderMarkdown() {
  //  const {
  //    cardHasHover,
  //    isArchived,
  //    isPrivate,
  //    setEditing,
  //    styles,
  //    textAreaValue
  //  } = this.props;
  //  const markdownStyles = css(
  //    styles.markdown,
  //    styles.content,
  //    isPrivate && styles.contentPrivate,
  //    !isArchived && cardHasHover && (isPrivate ? styles.privateContentOnHover : styles.contentOnHover),
  //    isArchived && styles.isArchived
  //  );
  //  return (
  //    <div onClick={!isArchived && setEditing} className={markdownStyles}>
  //      <Markdown source={textAreaValue}/>
  //    </div>
  //  );
  //}

  render() {
    return (
      <div>
        <Editor
          editorState={this.props.textAreaValue}
          onChange={this.props.setValue}
          onBlur={this.props.handleCardUpdate}
          plugins={this.plugins}
        />
          <this.EmojiSuggestions/>
      </div>
    )
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
    padding: ui.borderRadiusSmall
  }
});

export default withStyles(styleThunk)(OutcomeCardTextArea);

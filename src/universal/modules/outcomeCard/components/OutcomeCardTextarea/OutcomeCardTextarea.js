import {css} from 'aphrodite-local-styles/no-important';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import 'draft-js-emoji-plugin/lib/plugin.css';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import 'draft-js-linkify-plugin/lib/plugin.css';
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import createMentionPlugin from 'draft-js-mention-plugin';
import 'draft-js-mention-plugin/lib/plugin.css';

import {fromJS} from 'immutable';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import TagSuggestion from 'universal/components/TagSuggestion/TagSuggestion';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {tags} from 'universal/utils/constants';
//import createKeyShortcutsPlugin from 'universal/utils/createKeyShortcutsPlugin';
import createDocLinkPlugin from 'universal/utils/draft-js-linkify-plugin/src/index';
import ProjectEditor from 'universal/components/ProjectEditor/ProjectEditor';

const immutableTags = fromJS(tags);

const tagSuggestionFilter = (searchValue, suggestions) => {
  const value = searchValue.toLowerCase();
  const filteredSuggestions = suggestions.filter((suggestion) => (
    !value || suggestion.get('name').toLowerCase().startsWith(value)
  ));
  const size = filteredSuggestions.size < 5 ? filteredSuggestions.size : 5;
  return filteredSuggestions.setSize(size);
};

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
    setEditorState: PropTypes.func,
    styles: PropTypes.object,
    teamMembers: PropTypes.array,
    editorState: PropTypes.object,
    unsetEditing: PropTypes.func
  };

  //state = {
  //  suggestions: immutableTags,
  //  readOnly: false
  //};
  //
  //onSearchChange = ({value}) => {
  //  this.setState({
  //    suggestions: tagSuggestionFilter(value, immutableTags)
  //  });
  //};
  //
  //onAddMention = () => {
  //  // get the mention object selected
  //}

  //componentWillReceiveProps(nextProps) {
  //  //if (nextProps.editorState !== this.props.editorState) {
  //  //this.emojiPlugin = createEmojiPlugin();
  //  //this.EmojiSuggestions = this.emojiPlugin.EmojiSuggestions;
  //  //this.plugins = [this.emojiPlugin];
  //  //}
  //  //this.emojiPlugin = createEmojiPlugin();
  //  //this.EmojiSuggestions = this.emojiPlugin.EmojiSuggestions;
  //}

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
  //  const {setEditorState} = this.props;
  //  const value = e.target.value || newVal;
  //  setEditorState(value);
  //};

  //renderEditing() {
  //  const {
  //    handleCardUpdate,
  //    isArchived,
  //    isPrivate,
  //    styles,
  //    editorState
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
  //    <EditorLinkChanger.js
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
  //      value={editorState || ''}
  //      rows={3}
  //    >
  //      {/* <MentionMenu className={mentionMenuStyle} trigger="@" item={MentionTeamMember} resolve={atQuery} />*/}
  //      <MentionMenu className={mentionMenuStyle} trigger="#" item={MentionTag} resolve={tagQuery}/>
  //      <MentionMenu className={mentionMenuStyle} trigger=":" item={MentionEmoji} resolve={emojiQuery}
  //                   replace={emojiReplace}/>
  //    </EditorLinkChanger.js>
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
  //    editorState
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
  //      <Markdown source={editorState}/>
  //    </div>
  //  );
  //}

  //setEditing = (e) => {
  //  console.log('keyup')
  //  this.setState({readOnly: false})
  //  this.editor.focus()
  //};
  //
  //setFocus = (e) => {
  //
  //}
  render() {
    return (
        <ProjectEditor
          isDragging={this.props.isDragging}
          editorState={this.props.editorState}
          setEditorState={this.props.setEditorState}
          onBlur={this.props.handleCardUpdate}
        />
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

  tagSyggestionsEntryFocused: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff'
  },

  privateContentOnHover: {
    ...contentPrivateFA
  },

  markdown: {
    wordBreak: 'break-word'
  }
});

export default withStyles(styleThunk)(OutcomeCardTextArea);

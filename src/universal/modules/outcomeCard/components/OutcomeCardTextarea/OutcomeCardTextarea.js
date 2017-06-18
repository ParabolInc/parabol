// import {css} from 'aphrodite-local-styles/no-important';
// import createEmojiPlugin from 'draft-js-emoji-plugin';
// import 'draft-js-emoji-plugin/lib/plugin.css';
// import createLinkifyPlugin from 'draft-js-linkify-plugin';
// import 'draft-js-linkify-plugin/lib/plugin.css';
// import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
// import createMentionPlugin from 'draft-js-mention-plugin';
// import 'draft-js-mention-plugin/lib/plugin.css';
//
// import {fromJS} from 'immutable';
// import PropTypes from 'prop-types';
// import React, {Component} from 'react';
// import TagSuggestion from 'universal/components/TagSuggestion/TagSuggestion';
// import appTheme from 'universal/styles/theme/appTheme';
// import ui from 'universal/styles/ui';
// import withStyles from 'universal/styles/withStyles';
// import ProjectEditor from 'universal/components/ProjectEditor/ProjectEditor';
//
// //const immutableTags = fromJS(tags);
//
// //const tagSuggestionFilter = (searchValue, suggestions) => {
// //  const value = searchValue.toLowerCase();
// //  const filteredSuggestions = suggestions.filter((suggestion) => (
// //    !value || suggestion.get('name').toLowerCase().startsWith(value)
// //  ));
// //  const size = filteredSuggestions.size < 5 ? filteredSuggestions.size : 5;
// //  return filteredSuggestions.setSize(size);
// //};
//
// class OutcomeCardTextArea extends Component {
//  static propTypes = {
//    cardHasHover: PropTypes.bool,
//    content: PropTypes.string,
//    handleCardUpdate: PropTypes.func,
//    isArchived: PropTypes.bool,
//    isEditing: PropTypes.bool,
//    isPrivate: PropTypes.bool,
//    name: PropTypes.string,
//    setEditing: PropTypes.func,
//    setEditorState: PropTypes.func,
//    styles: PropTypes.object,
//    teamMembers: PropTypes.array,
//    editorState: PropTypes.object,
//    unsetEditing: PropTypes.func
//  };
//
//  //submitOnEnter = (e) => {
//  //  // hitting enter (not shift+enter or any wacky combo) submits the textarea
//  //  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
//  //    this.textAreaRef.blur();
//  //    const {handleCardUpdate, unsetEditing} = this.props;
//  //    handleCardUpdate();
//  //    unsetEditing();
//  //    e.preventDefault();
//  //  }
//  //};
//  //
//
//  render() {
//    return (
//        <ProjectEditor
//          isDragging={this.props.isDragging}
//          editorState={this.props.editorState}
//          setEditorState={this.props.setEditorState}
//          teamMembers={this.props.teamMembers}
//          onBlur={this.props.handleCardUpdate}
//        />
//    )
//  }
// }
//
// // const basePadding = '.375rem';
// // const labelHeight = '1.5rem';
//
// const baseStyles = {
//  backgroundColor: 'transparent',
//  border: 0,
//  boxShadow: 'none',
//  display: 'block',
//  fontFamily: appTheme.typography.sansSerif,
//  fontSize: appTheme.typography.s3,
//  lineHeight: appTheme.typography.s5,
//  outline: 'none',
//  resize: 'none',
//  width: '100%'
// };
//
// const contentBase = {
//  ...baseStyles,
//  borderBottom: '1px solid transparent',
//  borderTop: '1px solid transparent',
//  color: appTheme.palette.dark10d
// };
//
// const contentFA = {
//  backgroundColor: appTheme.palette.mid10l,
//  borderBottomColor: ui.cardBorderColor,
//  borderTopColor: ui.cardBorderColor,
//  color: appTheme.palette.mid10d
// };
//
// const contentPrivateFA = {
//  backgroundColor: ui.privateCardBgActive,
//  borderBottomColor: ui.cardBorderColor,
//  borderTopColor: ui.cardBorderColor,
//  color: appTheme.palette.mid10d
// };
//
// const descriptionBreakpoint = '@media (min-width: 90rem)';
//
// const styleThunk = () => ({
//  content: {
//    ...contentBase,
//    padding: `0 ${ui.cardPaddingBase} .1875rem`,
//
//    ':focus': {
//      ...contentFA
//    },
//    ':active': {
//      ...contentFA
//    },
//
//    [descriptionBreakpoint]: {
//      fontSize: appTheme.typography.sBase,
//      lineHeight: appTheme.typography.s6
//    }
//  },
//
//  isArchived: {
//    cursor: 'not-allowed',
//
//    ':focus': {
//      backgroundColor: 'transparent',
//      borderColor: 'transparent'
//    },
//    ':active': {
//      backgroundColor: 'transparent',
//      borderColor: 'transparent'
//    }
//  },
//
//  contentOnHover: {
//    ...contentFA
//  },
//
//  contentPrivate: {
//    // NOTE: modifies styles.content
//    ':focus': {
//      ...contentPrivateFA
//    },
//    ':active': {
//      ...contentPrivateFA
//    }
//  },
//
//  tagSyggestionsEntryFocused: {
//    backgroundColor: appTheme.palette.dark,
//    color: '#fff'
//  },
//
//  privateContentOnHover: {
//    ...contentPrivateFA
//  },
//
//  markdown: {
//    wordBreak: 'break-word'
//  }
// });
//
// export default withStyles(styleThunk)(OutcomeCardTextArea);

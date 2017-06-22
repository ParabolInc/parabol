import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withStyles from 'universal/styles/withStyles';

class TitleInput extends Component {
  static propTypes = {
    annouceEditing: PropTypes.func.isRequired,
    editorRef: PropTypes.any,
    handleCardUpdate: PropTypes.func.isRequired,
    setTitleRef: PropTypes.func.isRequired,
    setTitleValue: PropTypes.func.isRequired,
    styles: PropTypes.object,
    titleRef: PropTypes.any,
    titleValue: PropTypes.string
  };

  handleKeyDown = (e) => {
    console.log('key', e.key)
    if (e.key === 'ArrowDown' || e.key === 'Tab') {
      const {editorRef} = this.props;
      editorRef.focus();
      e.preventDefault()
    } else if (e.key === 'Enter') {
      const {titleRef} = this.props;
      titleRef.blur();
    }
  };

  handleFocus = () => {
    this.props.annouceEditing(true);
  };

  handleBlur = () => {
    // if the title is not null, save it. but if it is, let them edit the description first
    const {titleValue, handleCardUpdate} = this.props;
    if (titleValue) {
      handleCardUpdate();
    }
  };

  render() {
    const {setTitleRef, setTitleValue, styles, titleValue} = this.props;
    return (
      <input
        autoFocus={!titleValue}
        className={css(styles.contentTitle)}
        maxLength={140}
        onKeyDown={this.handleKeyDown}
        onBlur={this.handleBlur}
        onChange={setTitleValue}
        onFocus={this.handleFocus}
        placeholder="Add a title..."
        ref={setTitleRef}
        value={titleValue}
      />
    );
  }
}

const styleThunk = () => ({
  contentTitle: {
    outline: 'none',
    border: 'none',
    fontWeight: 800,
    fontSize: '1.25rem',
    maxWidth: '100%'
  }
});

export default withStyles(styleThunk)(
  TitleInput
);
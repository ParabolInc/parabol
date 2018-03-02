import { getDefaultKeyBinding, KeyBindingUtil, RichUtils } from 'draft-js';
import React, { Component } from 'react';
import { OrderedSet } from 'immutable';
import PropTypes from 'prop-types';
import customStyleMap from './customStyleMap';

const { hasCommandModifier } = KeyBindingUtil;

const withFontSizes = ComposedComponent => {
  class WithFontSizes extends Component {
    static propTypes = {
      editorState: PropTypes.object.isRequired,
      handleKeyCommand: PropTypes.func,
      keyBindingFn: PropTypes.func,
      setEditorState: PropTypes.func.isRequired
    };

    state = {
      nextInlineStyleId: 1
    };

    commands = {
      increaseFontSize: 'increase-font-size',
      decreaseFontSize: 'decrease-font-size'
    };

    inlineStyles = {
      FONT_SIZE_11: 'FONT_SIZE_11',
      FONT_SIZE_13: 'FONT_SIZE_13',
      FONT_SIZE_18: 'FONT_SIZE_18'
    };

    getNextInlineStyle = () => {
      return this.inlineStyles[this.state.nextInlineStyleId];
    };

    getSelectionInlineStyles(editorState) {
      const editorSelection = editorState.getSelection();
      const anchorKey = editorSelection.getAnchorKey();
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(anchorKey);
      const selectionStyles = block.getCharacterList().reduce((styles, c) => {
        if (
          styles &&
          styles.union &&
          c.getStyle()._map &&
          c.getStyle()._map._list._tail &&
          c.getStyle()._map._list._tail.array
        ) {
          return styles.union(c.getStyle());
        }
      }, OrderedSet());

      return selectionStyles && selectionStyles._map._list._tail && selectionStyles._map._list._tail.array;
    }

    increaseFontSizeAction = () => {
      const { editorState, setEditorState } = this.props;
      let fontSize = this.inlineStyles.FONT_SIZE_13;

      const selectionInlineStyles = this.getSelectionInlineStyles(editorState);

      if (selectionInlineStyles) {
        const fontStyle = selectionInlineStyles.find(style => {
          return style.includes(
            this.inlineStyles.FONT_SIZE_11,
            this.inlineStyles.FONT_SIZE_13,
            this.inlineStyles.FONT_SIZE_18
          );
        });


        if (selectionInlineStyles.includes(this.inlineStyles.FONT_SIZE_11)) {
          fontSize = this.inlineStyles.FONT_SIZE_13;
        }

        if (selectionInlineStyles.includes(this.inlineStyles.FONT_SIZE_13)) {
          fontSize = this.inlineStyles.FONT_SIZE_18;
        }
        setEditorState(RichUtils.toggleInlineStyle(editorState, fontSize));
      }

      return 'handled';
    };

    decreaseFontSizeAction = () => {
      const { editorState, setEditorState } = this.props;
      let fontSize = this.inlineStyles.FONT_SIZE_13;

      const selectionInlineStyles = this.getSelectionInlineStyles(editorState);
      if (selectionInlineStyles) {
        const fontStyle = selectionInlineStyles.find(style => {
            return style.includes(
              this.inlineStyles.FONT_SIZE_11,
              this.inlineStyles.FONT_SIZE_13,
              this.inlineStyles.FONT_SIZE_18
            );
          });


        if (selectionInlineStyles.includes(this.inlineStyles.FONT_SIZE_13)) {
          fontSize = this.inlineStyles.FONT_SIZE_11;
        } else if (selectionInlineStyles.includes(this.inlineStyles.FONT_SIZE_18)) {
          fontSize = this.inlineStyles.FONT_SIZE_13;
        } else {
          fontSize = this.inlineStyles.FONT_SIZE_13;
        }

        setEditorState(RichUtils.toggleInlineStyle(editorState, fontSize));
      }

      return 'handled';
    };

    getKeystrokeHandler = error => {
      const increaseFontSize = this.commands.increaseFontSize;
      const decreaseFontSize = this.commands.decreaseFontSize;
      const keystrokeHandlerMap = {
        [increaseFontSize]: this.increaseFontSizeAction,
        [decreaseFontSize]: this.decreaseFontSizeAction
      };

      if (keystrokeHandlerMap.hasOwnProperty(error)) {
        return keystrokeHandlerMap[error]();
      }

      return 'not-handled';
    };

    _handleKeyCommand = command => {
      const { handleKeyCommand } = this.props;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command);
        if (result === 'handled' || result === true) {
          return result;
        }
      }
      return undefined;
    };

    handleKeyCommand = command => {
      this._handleKeyCommand(command);

      const commands = this.commands;

      this.getKeystrokeHandler(commands.increaseFontSize);
      this.getKeystrokeHandler(commands.decreaseFontSize);
    };

    keyBindingFn = e => {
      if (hasCommandModifier(e) && e.shiftKey && e.keyCode === 187) {
        // 187 === +
        return this.commands.increaseFontSize;
      }

      if (hasCommandModifier(e) && e.shiftKey && e.key === '-') {
        console.log('asd')
        return this.commands.decreaseFontSize;
      }

      return undefined;
    };

    render() {
      return (
        <ComposedComponent {...this.props} handleKeyCommand={this.handleKeyCommand} keyBindingFn={this.keyBindingFn} />
      );
    }
  }
  return WithFontSizes;
};

export default withFontSizes;

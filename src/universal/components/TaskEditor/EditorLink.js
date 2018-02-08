import PropTypes from 'prop-types';
import React, {Component} from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const baseStyle = {
  color: appTheme.palette.cool
};

const EditorLink = (getEditorState) => class _EditorLink extends Component {
  static propTypes = {
    children: PropTypes.any,
    contentState: PropTypes.object.isRequired,
    entityKey: PropTypes.string,
    offsetkey: PropTypes.string,
    styles: PropTypes.object
  };

  state = {hasFocus: false};

  onClick = (e) => {
    const hasFocus = getEditorState().getSelection().getHasFocus();
    if (hasFocus) return;
    e.preventDefault();
    const {contentState, entityKey} = this.props;
    const {href} = contentState.getEntity(entityKey).getData();
    window.open(href, '_blank');
  };

  onMouseOver = () => {
    const hasFocus = getEditorState().getSelection().getHasFocus();
    if (this.state.hasFocus !== hasFocus) {
      this.setState({hasFocus});
    }
  };

  render() {
    const {offsetkey, children} = this.props;
    const {hasFocus} = this.state;
    const style = {
      ...baseStyle,
      cursor: hasFocus ? 'text' : 'pointer'
    };
    return (
      <span data-offset-key={offsetkey} style={style} onMouseOver={this.onMouseOver} onMouseDown={this.onClick}>
        {children}
      </span>
    );
  }
};

export default EditorLink;

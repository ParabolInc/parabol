import {css} from 'aphrodite-local-styles/no-important';
import React, {Component} from 'react';
import portal from 'react-portal-hoc';
import Button from 'universal/components/Button/Button';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import makeRemoveLink from 'universal/components/ProjectEditor/operations/makeRemoveLink';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import boundedModal from 'universal/decorators/boundedModal/boundedModal';
import PropTypes from 'prop-types';

const dontTellDraft = (e) => {
  e.preventDefault();
  e.stopPropagation();
};


class EditorLinkViewer extends Component {
  render() {
    const {
      left,
      top,
      href,
      isClosing,
      styles,
      addHyperlink,
      setRef
    } = this.props;

    const linkViewer = {
      left,
      top,
      position: 'absolute'
    };
    const menuStyles = css(
      styles.modal,
      isClosing && styles.closing
    );

    const removeLink = () => {
      const {editorState, setEditorState, removeModal} = this.props;
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const blockText = block.getText();
      const {begin, end} = getWordAt(blockText, anchorOffset);
      setEditorState(makeRemoveLink(block.getKey(), begin, end)(editorState));
      removeModal();
    };

    const changeLink = () => {
      addHyperlink();
    };

    return (
      <div style={linkViewer} className={menuStyles} onMouseDown={dontTellDraft} ref={setRef}>
        <span className={css(styles.url)}>
          <a className={css(styles.linkText)} href={href} rel="noopener noreferrer" target="_blank">{href}</a>
        </span>
        <Button buttonStyle="flat" size="smallest" colorPalette="cool" label="Change" onClick={changeLink} />
        <Button buttonStyle="flat" size="smallest" colorPalette="cool" label="Remove" onClick={removeLink} />
      </div>
    );
  }
}

EditorLinkViewer.propTypes = {
  addHyperlink: PropTypes.func.isRequired,
  href: PropTypes.string,
  editorState: PropTypes.object,
  isClosing: PropTypes.bool,
  left: PropTypes.number,
  removeModal: PropTypes.func.isRequired,
  setEditorState: PropTypes.func.isRequired,
  setRef: PropTypes.func,
  styles: PropTypes.object,
  top: PropTypes.number
};


const animateIn = {
  '0%': {
    opacity: '0',
    transform: 'translate3d(0, -32px, 0)'

  },
  '100%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'
  }
};

const animateOut = {
  '0%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'

  },
  '100%': {
    opacity: '0',
    transform: 'translate3d(0, -32px, 0)'
  }
};

const styleThunk = (theme, props) => ({
  modal: {
    alignItems: 'center',
    animationDuration: '200ms',
    animationName: animateIn,
    background: '#fff',
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    display: 'flex',
    fontSize: appTheme.typography.s5,
    padding: '0 .25rem',
    zIndex: 1
  },

  closing: {
    animationDuration: `${props.closeAfter}ms`,
    animationName: animateOut
  },

  url: {
    ...textOverflow,
    alignItems: 'center',
    borderRight: `1px solid ${ui.cardBorderColor}`,
    display: 'flex',
    flexShrink: 2,
    fontSize: appTheme.typography.s3,
    height: '100%',
    marginRight: '.25rem',
    padding: '.75rem'
  },

  linkText: {
    ...textOverflow,
    marginRight: '0.5rem',
    maxWidth: '20rem'
  }
});

export default portal({closeAfter: 100})(
  boundedModal(
    withStyles(styleThunk)(EditorLinkViewer)
  )
);

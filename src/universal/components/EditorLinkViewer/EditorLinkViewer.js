import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import portal from 'react-portal-hoc';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import makeRemoveLink from 'universal/components/ProjectEditor/operations/makeRemoveLink';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import Button from 'universal/components/Button/Button';
import {textOverflow} from 'universal/styles/helpers';

const dontTellDraft = (e) => {
  e.preventDefault()
  e.stopPropagation();
};

const EditorLinkViewer = (props) => {
  const {
    isClosing,
    left,
    top,
    linkData,
    styles,
    addHyperlink,
    editorState
  } = props;

  const {href} = linkData;
  const linkViewer = {
    left,
    top,
    position: 'absolute'
  };
  const menuStyles = css(
    styles.modal,
    isClosing && styles.closing
  );

  const removeLink = (e) => {
    const {editorState, setEditorState, removeModal} = props;
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const blockText = block.getText();
    const {begin, end} = getWordAt(blockText, anchorOffset);
    setEditorState(makeRemoveLink(block.getKey(), begin, end)(editorState));
    removeModal();
  };

  const changeLink = (e) => {
    addHyperlink(editorState);
  };

  return (
    <div style={linkViewer} className={menuStyles} onMouseDown={dontTellDraft}>
      <span className={css(styles.url)}>
        <a className={css(styles.linkText)} href={href} rel="noopener noreferrer" target="_blank">{href}</a>
      </span>

      <Button buttonStyle="flat" size="small" colorPalette="cool" label="Change" onClick={changeLink}/>
      <Button buttonStyle="flat" size="small" colorPalette="cool" label="Remove" onClick={removeLink}/>
    </div>
  )
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
  closing: {
    animationDuration: `${props.closeAfter}ms`,
    animationName: animateOut
  },

  modal: {
    alignItems: 'center',
    background: '#fff',
    border: `1px solid ${ui.cardBorderCoor}`,
    borderRadius: ui.borderRadiusSmall,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    display: 'flex',
    //padding: ui.borderRadiusSmall,
    zIndex: 1,
    animationName: animateIn,
    animationDuration: '200ms',
    fontSize: appTheme.typography.s5,
    fontWeight: 600,
    margin: '0.5rem',
    height: '64px'
  },

  active: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff'
  },

  description: {
    marginLeft: '.5rem'
  },

  linkText: {
    ...textOverflow,
    marginRight: '0.5rem',
    maxWidth: '20rem'
  },
  row: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    padding: '.5rem'
  },

  url: {
    ...textOverflow,
    flexShrink: 2,
    alignItems: 'center',
    borderRight: `2px solid ${appTheme.palette.mid20l}`,
    display: 'flex',
    height: '100%',
    margin: '0.5rem'
  },
  value: {
    fontWeight: 700
  }
});

export default portal({closeAfter: 100})(
  withStyles(styleThunk)(EditorLinkViewer)
)
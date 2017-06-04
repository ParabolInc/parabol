import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import portal from 'react-portal-hoc';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import makeRemoveLink from 'universal/components/ProjectEditor/operations/makeRemoveLink';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';

const dontTellDraft = (e) => {
  e.preventDefault();
};

const EditorLinkChanger = (props) => {
  const {
    isClosing,
    left,
    top,
    entityData,
    styles,
  } = props;
  if (!entityData) return null;
  const {href} = entityData;
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
    const {editorState, onChange, removeModal} = props;
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const blockText = block.getText();
    const {begin, end} = getWordAt(blockText, anchorOffset);
    onChange(makeRemoveLink(block.getKey(), begin, end)(editorState));
    removeModal();
  };
  return (

    <div style={linkViewer} className={menuStyles}>
      <span>
        <a href={href} rel="noopener noreferrer" onMouseDown={dontTellDraft} target="_blank">{href}</a>
      </span>
      <span> - </span>
      <span>Change</span>
      <span> | </span>
      <span onMouseDown={dontTellDraft} onClick={removeLink}>Remove</span>
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
    background: '#fff',
    border: `1px solid ${ui.cardBorderCoor}`,
    borderRadius: ui.borderRadiusSmall,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    padding: ui.borderRadiusSmall,
    zIndex: 1,
    animationName: animateIn,
    animationDuration: '200ms'
  },

  active: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff'
  },

  description: {
    marginLeft: '.5rem'
  },

  row: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    padding: '.5rem'
  },

  value: {
    fontWeight: 700
  }
});

export default portal({closeAfter: 100})(
  withStyles(styleThunk)(EditorLinkChanger)
)
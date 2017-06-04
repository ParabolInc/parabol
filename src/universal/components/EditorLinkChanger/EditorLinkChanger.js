import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import portal from 'react-portal-hoc';
import Button from 'universal/components/Button/Button';
import getSelectionText from 'universal/components/ProjectEditor/getSelectionText';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const dontTellDraft = (e) => {
  e.preventDefault();
};

const EditorLinkChanger = (props) => {
  const {
    editorState,
    isClosing,
    left,
    top,
    linkData,
    styles
  } = props;

  const {selectionState, href} = linkData;
  const menuStyles = css(
    styles.modal,
    isClosing && styles.closing
  );
  const text = getSelectionText(editorState, selectionState);

  return (
    <div className={menuStyles} onMouseDown={dontTellDraft}>
      {text !== null &&
      <div className={css(styles.textBlock)}>
        <span>Text</span>
        <input/>
      </div>
      }

      <div className={css(styles.hrefBlock)}>
        <span>Link</span>
        <input/>
      </div>
      <div className={css(styles.buttonBlock)}>
        <Button
          colorPalette="cool"
          size="small"
          label="Add"
        />
      </div>
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
  buttonBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.125rem'
  },
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
    animationDuration: '200ms',
    position: 'absolute',
    left: props.left,
    top: props.top
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
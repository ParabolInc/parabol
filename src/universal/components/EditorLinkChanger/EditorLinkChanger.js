import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import portal from 'react-portal-hoc';
import Button from 'universal/components/Button/Button';
import getSelectionText from 'universal/components/ProjectEditor/getSelectionText';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import shouldValidate from 'universal/validation/shouldValidate';
import {reduxForm, Field} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import changerValidation from './changerValidation';
import completeEntity from 'universal/components/ProjectEditor/operations/completeEnitity';
import linkify from 'universal/utils/linkify';

const validate = (values) => {
  const schema = changerValidation();
  return schema(values).errors;
};

const dontTellDraft = (e) => {
  e.preventDefault();
};

//const
const EditorLinkChanger = (props) => {
  const {
    editorState,
    editorRef,
    isClosing,
    left,
    top,
    linkData,
    styles,
    removeModal,
    handleSubmit,
    submitting,
    setEditorState,
    setEdit
  } = props;

  const {selectionState} = linkData;
  const menuStyles = css(
    styles.modal,
    isClosing && styles.closing
  );
  const text = getSelectionText(editorState, selectionState);
  const onSubmit = (submissionData) => {
    const schema = changerValidation();
    const {data} = schema(submissionData);

    const href = linkify.match(data.link)[0].url;
    removeModal();
    editorRef.focus();
    setEditorState(completeEntity(editorState, 'insert-link', {href}, data.text));
  };

  let stillInModal = null;
  const handleMouseDown = (e) => {
    stillInModal = true;
  }
  const handleBlur = (e) => {
    if (!stillInModal ){
      removeModal();
    }
    stillInModal = null;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      stillInModal = true;
    }
  }
  return (
    <div className={menuStyles} onKeyDown={handleKeyDown} onBlur={handleBlur} onMouseDown={handleMouseDown} tabIndex={-1}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {text !== null &&
          <div className={css(styles.textBlock)}>
            <span>Text</span>
            <Field
              autoFocus
              component={InputField}
              name="text"
            />
          </div>
        }
        <div className={css(styles.hrefBlock)}>
          <span>Link</span>
          <Field
            autoFocus={text === null}
            component={InputField}
            name="link"
          />
        </div>
        <div className={css(styles.buttonBlock)}>
          <Button
            colorPalette="cool"
            label="Add"
            size="small"
            type="submit"
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </form>
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
    outline: 'none',
    padding: ui.borderRadiusSmall,
    zIndex: 1,
    animationName: animateIn,
    animationDuration: '200ms',
    position: 'absolute',
    left: props.left,
    top: props.top,
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
  reduxForm({form: 'linkChanger', validate, shouldValidate, immutables: ['editorState']})(
    withStyles(styleThunk)(EditorLinkChanger)
  )
)
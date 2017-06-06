import {css} from 'aphrodite-local-styles/no-important';
import React, {Component} from 'react';
import portal from 'react-portal-hoc';
import {Field, reduxForm} from 'redux-form';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import completeEntity from 'universal/components/ProjectEditor/operations/completeEnitity';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import linkify from 'universal/utils/linkify';
import shouldValidate from 'universal/validation/shouldValidate';
import changerValidation from './changerValidation';

const validate = (values) => {
  const schema = changerValidation();
  return schema(values).errors;
};

const dontTellDraft = (e) => {
  e.preventDefault();
};

//const
class EditorLinkChanger extends Component {

  constructor(props) {
    super(props);
    this.stillInModal = null;
  }

  onSubmit = (submissionData) => {
    const {editorState, editorRef, removeModal, setEditorState} = this.props;
    const schema = changerValidation();
    const {data} = schema(submissionData);
    const href = linkify.match(data.link)[0].url;
    removeModal(true);
    setEditorState(completeEntity(editorState, 'LINK', {href}, data.text))
    setTimeout(() => editorRef.focus(), 0);
  };

  handleMouseDown = (e) => {
    this.stillInModal = true;
  }

  handleBlur = (e) => {
    if (!this.stillInModal) {
      this.props.removeModal(true);
    }
    this.stillInModal = null;
  };

  handleKeyDown = (e) => {
    const {removeModal, editorRef} = this.props;
    if (e.key === 'Tab') {
      this.stillInModal = true;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      removeModal(true);
      editorRef.focus()
    }
  };

  render() {
    const {
      editorState,
      isClosing,
      left,
      top,
      linkData,
      styles,
      handleSubmit,
    } = this.props;

    const pos = {left, top};
    const {text} = linkData;
    const menuStyles = css(
      styles.modal,
      isClosing && styles.closing
    );

    return (
      <div style={pos} className={menuStyles} onKeyDown={this.handleKeyDown} onBlur={this.handleBlur}
           onMouseDown={this.handleMouseDown} tabIndex={-1}>
        <form onSubmit={handleSubmit(this.onSubmit)}>
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
              onClick={handleSubmit(this.onSubmit)}
            />
          </div>
        </form>
      </div>
    )
  }
}
;

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
    position: 'absolute'
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
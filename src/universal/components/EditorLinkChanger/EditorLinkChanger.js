import {css} from 'aphrodite-local-styles/no-important';
import {EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import portal from 'react-portal-hoc';
import {Field, reduxForm} from 'redux-form';
import Button from 'universal/components/Button/Button';
import PlainInputField from 'universal/components/PlainInputField/PlainInputField';
import boundedModal from 'universal/decorators/boundedModal/boundedModal';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import completeEntity from 'universal/utils/draftjs/completeEnitity';
import linkify from 'universal/utils/linkify';
import shouldValidate from 'universal/validation/shouldValidate';
import changerValidation from './changerValidation';

const validate = (values) => {
  const schema = changerValidation();
  return schema(values).errors;
};

class EditorLinkChanger extends Component {
  onSubmit = (submissionData) => {
    const {editorState, editorRef, removeModal, selectionState, setEditorState} = this.props;
    const schema = changerValidation();
    const {data} = schema(submissionData);
    const href = linkify.match(data.link)[0].url;
    removeModal(true);
    const focusedEditorState = EditorState.forceSelection(editorState, selectionState);
    const nextEditorState = completeEntity(focusedEditorState, 'LINK', {href}, data.text);
    setEditorState(nextEditorState);
    setTimeout(() => editorRef.focus(), 0);
  };

  handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.props.removeModal(true);
    }
  };

  handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      const {editorRef, removeModal} = this.props;
      removeModal(true);
      setTimeout(() => editorRef.focus(), 0);
    }
  };

  componentWillMount() {
    const {setEditingMeta} = this.props;
    setEditingMeta(true);
  }

  componentWillUnmount() {
    const {setEditingMeta} = this.props;
    setEditingMeta(false);
  }

  render() {
    const {
      isClosing,
      left,
      top,
      styles,
      handleSubmit,
      valid,
      setRef,
      text
    } = this.props;

    const pos = {left, top};
    const menuStyles = css(
      styles.modal,
      isClosing && styles.closing
    );
    const label = text ? 'Update' : 'Add';
    return (
      <div
        style={pos}
        className={menuStyles}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        tabIndex={-1}
        ref={setRef}
      >
        <form onSubmit={handleSubmit(this.onSubmit)} className={css(styles.form)}>
          {text !== null &&
          <div className={css(styles.textBlock)}>
            <span className={css(styles.inputLabel)}>{'Text'}</span>
            <Field
              autoFocus
              colorPalette="link"
              component={PlainInputField}
              name="text"
            />
          </div>
          }
          <div className={css(styles.textBlock)}>
            <span className={css(styles.inputLabel)}>{'Link'}</span>
            <Field
              autoFocus={text === null}
              colorPalette="link"
              component={PlainInputField}
              name="link"
              spellCheck={false}
            />
          </div>
          <div className={css(styles.buttonBlock)}>
            <Button
              colorPalette="dark"
              disabled={!valid}
              label={label}
              size="smallest"
              type="submit"
              onClick={handleSubmit(this.onSubmit)}
            />
          </div>
        </form>
      </div>
    );
  }
}

EditorLinkChanger.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  href: PropTypes.string,
  editorRef: PropTypes.any,
  editorState: PropTypes.object,
  isClosing: PropTypes.bool,
  left: PropTypes.number,
  removeModal: PropTypes.func.isRequired,
  selectionState: PropTypes.object.isRequired,
  setEditorState: PropTypes.func.isRequired,
  setEditingMeta: PropTypes.func.isRequired,
  setRef: PropTypes.func,
  styles: PropTypes.object,
  text: PropTypes.string,
  top: PropTypes.number,
  valid: PropTypes.bool
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
    animationDuration: '200ms',
    animationName: animateIn,
    background: '#fff',
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    outline: 'none',
    padding: '.5rem .5rem .5rem 1rem',
    position: 'absolute',
    zIndex: ui.ziMenu
  },

  closing: {
    animationDuration: `${props.closeAfter}ms`,
    animationName: animateOut
  },

  form: {
    // Define
  },

  textBlock: {
    // use baseline so errors don't bump it off center
    alignItems: 'top',
    display: 'flex',
    marginBottom: '.5rem'
  },

  inputLabel: {
    display: 'block',
    fontSize: '.9375rem',
    fontWeight: 700,
    lineHeight: '2rem',
    marginRight: '.5rem'
  },

  buttonBlock: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
});

export default portal({closeAfter: 100})(
  reduxForm({form: 'linkChanger', validate, shouldValidate, immutableProps: ['editorState', 'selectionState']})(
    boundedModal(
      withStyles(styleThunk)(EditorLinkChanger)
    )
  )
);

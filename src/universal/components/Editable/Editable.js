import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
import FontAwesome from 'react-fontawesome';
import {reduxForm, Field} from 'redux-form';
import EditableInput from './EditableInput';

const Editable = (props) => {
  const {
    form,
    handleSubmit,
    hideIconOnValue,
    icon,
    initialValue,
    isEditing,
    placeholder,
    styles,
    setEditing,
    submitOnBlur,
    unsetEditing,
    updateEditable
  } = props;

  const renderEditing = () => {
    const inputStyles = css(
      styles.static,
      styles.input
    );

    const submitAndSet = (e) => {
      e.preventDefault();
      const errors = handleSubmit(updateEditable)();
      if (!errors) {
        unsetEditing();
      }
    };
    return (
      <form onSubmit={submitAndSet}>
        <Field
          autoFocus
          component={EditableInput}
          handleSubmit={submitAndSet}
          inputStyles={inputStyles}
          name={form}
          placeholder={placeholder}
          submitOnBlur={submitOnBlur}
          type="text"
          unsetEditing={unsetEditing}
        />
      </form>
    );
  };

  const renderStatic = () => {
    const staticStyles = css(
      styles.static,
      !initialValue && styles.placeholder
    );

    const hideIcon = initialValue && hideIconOnValue;
    return (
      <div className={css(styles.staticBlock)} onClick={setEditing}>
        <div className={staticStyles}>
          {initialValue || placeholder}
        </div>
        {!hideIcon &&
        <FontAwesome
          className={css(styles.icon)}
          name={icon || 'pencil'}
        />
        }
      </div>
    );
  };
  return (
    <div className={css(styles.editableRoot)}>
      {isEditing ? renderEditing() : renderStatic()}
    </div>
  );
};

Editable.propTypes = {
  // NOTE: Use 'hideIconOnValue' when you want to hide
  //       the pencil icon when there is a value. (TA)
  hideIconOnValue: PropTypes.bool,
  icon: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string
  }),
  isEditing: PropTypes.bool,
  placeholder: PropTypes.string,
  styles: PropTypes.object,
  typeStyles: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.string,
    lineHeight: PropTypes.string,
    placeholderColor: PropTypes.string
  })
};

const styleThunk = (customTheme, props) => ({
  editableRoot: {
    display: 'block',
    height: props.typeStyles.lineHeight,
    width: '100%'
  },

  staticBlock: {
    display: 'inline-block',
    fontSize: 0,
    height: props.typeStyles.lineHeight,
    verticalAlign: 'top',

    ':hover': {
      cursor: 'pointer',
      opacity: '.5'
    }
  },

  static: {
    color: props.typeStyles.color,
    display: 'inline-block',
    fontSize: props.typeStyles.fontSize,
    lineHeight: props.typeStyles.lineHeight,
    verticalAlign: 'middle'
  },

  placeholder: {
    color: props.typeStyles.placeholderColor
  },

  icon: {
    color: appTheme.palette.dark,
    display: 'inline-block !important',
    fontSize: `${ui.iconSize} !important`,
    marginLeft: '.375rem',
    verticalAlign: 'middle !important'
  },

  input: {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 0,
    borderRadius: 0,
    display: 'inline-block',
    outline: 'none',
    padding: 0,
    verticalAlign: 'top',
    width: '100%',

    ...makePlaceholderStyles(props.typeStyles.placeholderColor)
  }
});

export default reduxForm()(
  withStyles(styleThunk)(Editable)
);

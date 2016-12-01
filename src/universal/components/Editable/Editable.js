import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
import FontAwesome from 'react-fontawesome';

class Editable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    };
  }

  setEditing = () => {
    this.setState({
      isEditing: true
    });
  };

  unsetEditing = () => {
    const {input, untouch} = this.props;
    this.setState({
      isEditing: false
    });
    input.onBlur();
    if (untouch) {
      untouch(input.name);
    }
  };

  renderEditing = () => {
    const {
      handleSubmit,
      input,
      meta: {dirty, error, touched},
      placeholder,
      styles,
      submitOnBlur,
      touch
    } = this.props;
    const inputStyles = css(
      styles.static,
      styles.input
    );

    const submitAndSet = (e) => {
      e.preventDefault();
      if (!handleSubmit()) {
        this.unsetEditing();
      }
    };
    const maybeSubmitOnBlur = (e) => {
      if (touch) {
        touch(input.name);
      }
      if (submitOnBlur) {
        submitAndSet(e);
      } else if (!input.value || (!error && !dirty)) {
        this.unsetEditing();
      }
    };
    return (
      <form onSubmit={submitAndSet}>
        <input
          {...input}
          autoFocus
          className={inputStyles}
          onBlur={maybeSubmitOnBlur}
          placeholder={placeholder}
        />
        {touched && error && <div className={css(styles.error)}>{error}</div>}
      </form>
    );
  };

  renderStatic = () => {
    const {
      hideIconOnValue,
      icon,
      initialValue,
      placeholder,
      styles,
    } = this.props;
    const staticStyles = css(
      styles.static,
      !initialValue && styles.placeholder
    );

    const hideIcon = initialValue && hideIconOnValue;
    return (
      <div className={css(styles.staticBlock)} onClick={this.setEditing}>
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

  render() {
    const {styles} = this.props;
    return (
      <div className={css(styles.editableRoot)}>
        {this.state.isEditing ? this.renderEditing() : this.renderStatic()}
      </div>
    );
  }
}

Editable.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
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
  initialValue: PropTypes.string,
  isEditing: PropTypes.bool,
  meta: PropTypes.object,
  placeholder: PropTypes.string,
  styles: PropTypes.object,
  submitOnBlur: PropTypes.bool,
  typeStyles: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.string,
    lineHeight: PropTypes.string,
    placeholderColor: PropTypes.string
  }),
  touch: PropTypes.func.isRequired,
  untouch: PropTypes.func.isRequired

};

const styleThunk = (customTheme, props) => ({
  editableRoot: {
    display: 'block',
    height: props.typeStyles.lineHeight,
    width: '100%'
  },

  error: {
    color: appTheme.palette.warm,
    fontSize: '.85rem'
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

export default withStyles(styleThunk)(Editable);

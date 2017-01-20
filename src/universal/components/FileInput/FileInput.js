import React, {Component, PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

class FileInput extends Component {
  static propTypes = {
    buttonLabel: PropTypes.string,
    colorPalette: PropTypes.oneOf(ui.buttonColorPalette),
    input: PropTypes.object,
    meta: PropTypes.object.isRequired,
    previousValue: PropTypes.string,
    size: PropTypes.oneOf(ui.buttonSizes),
    styles: PropTypes.object
  };

  static defaultProps = {
    buttonLabel: 'Upload',
    colorPalette: 'gray',
    size: 'small'
  };

  onChange(e) {
    const {input: {onChange}} = this.props;
    onChange(e.target.files[0]);
  }

  render() {
    const {
      buttonLabel,
      colorPalette,
      input: {value},
      meta: {touched, error},
      previousValue,
      size,
      styles
    } = this.props;

    let errorString = error;
    if (typeof error === 'object') {
      errorString = Object.keys(error).map(k => error[k]).join(', ');
    }

    return (
      <div>
        <div className={css(styles.control)}>
          <Button
            label={buttonLabel}
            size={size}
            colorPalette={colorPalette}
            type="button"
          />
          <input
            className={css(styles.input)}
            key={previousValue} // see: https://github.com/erikras/redux-form/issues/769
            type="file"
            value={value}
            onChange={(e) => this.onChange(e)}
          />
        </div>
        {touched && error &&
          <FieldHelpText
            hasErrorText
            helpText={errorString}
            key={`${previousValue}Error`}
          />
        }
      </div>
    );
  }
}

const styleThunk = () => ({
  control: {
    overflow: 'hidden',
    position: 'relative',

    ':hover': {
      opacity: '.65'
    },
    ':focus': {
      opacity: '.65'
    }
  },

  input: {
    cursor: 'pointer',
    display: 'block',
    fontSize: '999px',
    filter: 'alpha(opacity=0)',
    minHeight: '100%',
    minWidth: '100%',
    opacity: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 0
  }
});

export default withStyles(styleThunk)(FileInput);

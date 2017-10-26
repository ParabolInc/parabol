import PropTypes from 'prop-types';
import React from 'react';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import Button from 'universal/components/Button/Button';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const hiddenUglyButton = {
  display: 'none'
};
const FileInput = (props) => {
  const {
    accept,
    doSubmit,
    meta: {touched, error},
    size,
    styles,
    buttonLabel,
    colorPalette
  } = props;
  let errorString = error;
  if (typeof error === 'object') {
    errorString = Object.keys(error).map((k) => error[k]).join(', ');
  }
  let el;
  return (
    <div>
      <div className={css(styles.control)}>
        <Button
          label={buttonLabel}
          buttonSize={size}
          colorPalette={colorPalette}
          type="button"
          onClick={() => { el.click(); }}
        />
        <input
          accept={accept}
          onChange={(e) => {
            // send the file to the redux-form FileList manager
            props.input.onChange(e.currentTarget.files[0]);
            // if not pushed to the back of the queue, the values don't update, even if the parent component is force updated
            setTimeout(() => doSubmit(), 0);
          }}
          style={hiddenUglyButton}
          type="file"
          value={undefined} // required to avoid value change security console message
          ref={(c) => { el = c; }}
        />
      </div>
      {touched && error &&
        <FieldHelpText
          hasErrorText
          helpText={errorString}
        />
      }
    </div>
  );
};

FileInput.propTypes = {
  accept: PropTypes.any,
  doSubmit: PropTypes.func,
  buttonLabel: PropTypes.string,
  colorPalette: PropTypes.oneOf(ui.paletteOptions),
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  size: PropTypes.oneOf(ui.buttonSizeOptions),
  styles: PropTypes.object
};

FileInput.defaultProps = {
  buttonLabel: 'Submit',
  colorPalette: 'gray',
  size: 'small'
};

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

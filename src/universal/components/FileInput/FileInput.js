import React, {Component, PropTypes} from 'react';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import Button from 'universal/components/Button/Button';
import shortid from 'shortid';

const hiddenUglyButton = {
  display: 'none'
};

const FileInput = (props) => {
    const {accept, input: {value}, doSubmit, meta: {touched, error}, touch, previousValue, forceUpdate} = props;

    let errorString = error;
    if (typeof error === 'object') {
      errorString = Object.keys(error).map(k => error[k]).join(', ');
    }
    let el;
    return (
      <div>
        <Button colorPalette="cool" label="Change Avatar" onClick={() => {el.click()}}/>
        <input
          accept={accept}
          onChange={(e) => {
            // send the file to the redux-form FileList manager
            props.input.onChange(e.target.files[0]);
            // if not pushed to the back of the queue, the values don't update, even if the parent component is force updated
            setTimeout(() => doSubmit(), 0)
          }}
          style={hiddenUglyButton}
          type="file"
          value={undefined} // required to avoid value change security console message
          ref={(c) => {el = c}}
        />
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
  input: PropTypes.object,
  previousValue: PropTypes.string,
  meta: PropTypes.object.isRequired,
};

export default FileInput;

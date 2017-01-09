import React, {Component, PropTypes} from 'react';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';

class FileInput extends Component {
  static propTypes = {
    input: PropTypes.object,
    previousValue: PropTypes.string,
    meta: PropTypes.object.isRequired,
  };

  onChange(e) {
    const {input: {onChange}} = this.props;
    onChange(e.target.files[0]);
  }

  render() {
    const {input: {value}, previousValue, meta: {touched, error}} = this.props;

    let errorString = error;
    if (typeof error === 'object') {
      errorString = Object.keys(error).map(k => error[k]).join(', ');
    }

    return (
      <div>
        <input
          key={previousValue} // see: https://github.com/erikras/redux-form/issues/769
          type="file"
          value={value}
          onChange={(e) => this.onChange(e)}
        />
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

export default FileInput;

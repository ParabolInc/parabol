import React, {Component, PropTypes} from 'react';

class FileInput extends Component {
  static propTypes = {
    input: PropTypes.object,
    previousValue: PropTypes.string
  };

  onChange(e) {
    const {input: {onChange}} = this.props;
    onChange(e.target.files[0]);
  }

  render() {
    const {input: {value}, previousValue} = this.props;

    return (<input
      key={previousValue} // see: https://github.com/erikras/redux-form/issues/769
      type="file"
      value={value}
      onChange={(e) => this.onChange(e)}
    />);
  }
}

export default FileInput;

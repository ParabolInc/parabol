import React, {Component, PropTypes} from 'react';

class FileInput extends Component {
  static propTypes = {
    input: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const {input: {onChange}} = this.props;
    onChange(e.target.files[0]);
  }

  render() {
    const {input: {value}} = this.props;

    return (<input
      type="file"
      value={value}
      onChange={this.onChange}
    />);
  }
}

export default FileInput;

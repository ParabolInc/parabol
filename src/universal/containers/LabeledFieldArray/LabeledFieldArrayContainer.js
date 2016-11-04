import React, {PropTypes, Component} from 'react';
import {FieldArray} from 'redux-form';
import FieldArrayRow from '../../components/FieldArrayRow/FieldArrayRow';

export default class LabeledFieldArray extends Component {
  static propTypes = {
    labelGetter: PropTypes.func.isRequired,
    labelHeader: PropTypes.string.isRequired,
    labelSource: PropTypes.string.isRequired,
    nestedFieldHeader: PropTypes.string.isRequired,
    nestedFieldName: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      hoverRow: null
    };
  }

  onHoverRow = (index) => { this.setState({ hoverRow: index }); };
  onLeaveRow = () => { this.setState({ hoverRow: null }); };

  render() {
    const {labelSource} = this.props;
    const {hoverRow} = this.state;
    return (
      <FieldArray
        {...this.props}
        name={labelSource}
        component={FieldArrayRow}
        hoverRow={hoverRow}
        onHoverRow={this.onHoverRow}
        onLeaveRow={this.onLeaveRow}
      />
    );
  }
}

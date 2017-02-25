import React, {PropTypes, Component} from 'react';
import {FieldArray} from 'redux-form';
import FieldArrayRow from 'universal/components/FieldArrayRow/FieldArrayRow';

export default class LabeledFieldArray extends Component {
  static propTypes = {
    existingInvites: PropTypes.array.isRequired,
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
    const {existingInvites, labelSource} = this.props;
    const {hoverRow} = this.state;
    return (
      <FieldArray
        {...this.props}
        component={FieldArrayRow}
        existingInvites={existingInvites}
        name={labelSource}
        hoverRow={hoverRow}
        onHoverRow={this.onHoverRow}
        onLeaveRow={this.onLeaveRow}
      />
    );
  }
}

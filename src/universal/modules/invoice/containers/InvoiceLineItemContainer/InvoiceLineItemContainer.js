import React, {PropTypes, Component} from 'react';
import InvoiceLineItem from 'universal/modules/invoice/components/InvoiceLineItem/InvoiceLineItem';

export default class InvoiceLineItemContainer extends Component {
  static propTypes = {
    item: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      detailsOpen: false
    };
  }

  toggleDetails = () => { this.setState({ detailsOpen: !this.state.detailsOpen }); };

  render() {
    return (
      <InvoiceLineItem
        detailsOpen={this.state.detailsOpen}
        detailsToggle={this.toggleDetails}
        item={this.props.item}
      />
    );
  }
}

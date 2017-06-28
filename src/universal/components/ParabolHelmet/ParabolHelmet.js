import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Helmet from 'react-helmet';

export default class ParabolHelmet extends Component {
  static contextTypes = {
    analytics: PropTypes.object
  };

  static propTypes = {
    title: PropTypes.string
  };

  componentDidMount() {
    this.context.analytics.title = this.props.title;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.title !== this.props.title) {
      this.context.analytics.title = nextProps.title;
    }

  }

  render() {
    return <Helmet {...this.props} />
  }
}

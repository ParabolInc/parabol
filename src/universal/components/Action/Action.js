import React, {PropTypes, Component} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {makePlaceholderStyles} from 'universal/styles/helpers';
import tinycolor from 'tinycolor2';
import layoutStyle from 'universal/styles/layout';
import Notifications from 'universal/modules/notifications/containers/Notifications/Notifications';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Action extends Component {
  static propTypes = {
    children: PropTypes.any,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillMount() {
    const {location: {pathname: nextPage}} = this.props;
    this.updateAnalyticsPage('', nextPage);
  }

  componentWillReceiveProps(nextProps) {
    const {location: {pathname: lastPage}} = this.props;
    const {location: {pathname: nextPage}} = nextProps;
    this.updateAnalyticsPage(lastPage, nextPage);
  }

  updateAnalyticsPage(lastPage, nextPage) {
    if (lastPage !== nextPage &&
      typeof window !== 'undefined' &&
      typeof window.analytics !== 'undefined') {
      window.analytics.page('', nextPage, {
        title: document && document.title || '',
        referrer: lastPage,
        path: nextPage
      });
    }
  }

  render() {
    return (
      <div className={styles.app}>
        <Notifications />
        {this.props.children}
      </div>
    );
  }
}

const basePlaceholderStyles = makePlaceholderStyles(theme.palette.dark50l);

styles = StyleSheet.create({
  app: {
    height: '100vh',
    margin: 0,
    maxWidth: layoutStyle.maxWidth,
    padding: 0
  }
});

StyleSheet.addCSS({
  '*': {
    boxSizing: 'border-box'
  },

  '*::before, *::after': {
    boxSizing: 'border-box'
  },

  html: {
    fontSize: '16px'
  },

  body: {
    color: theme.palette.dark10d,
    fontFamily: theme.typography.sansSerif,
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: 'normal',
    margin: 0,
    padding: 0
  },

  a: {
    color: theme.palette.cool,
    textDecoration: 'none'
  },

  'a:hover, a:focus': {
    color: tinycolor(theme.palette.cool).darken(15).toHexString(),
    textDecoration: 'underline'
  },

  input: {
    fontFamily: theme.typography.sansSerif,
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased'
  },

  ...basePlaceholderStyles
});

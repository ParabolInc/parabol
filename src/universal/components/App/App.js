import React, {PropTypes, Component} from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';
import layoutStyle from 'universal/styles/layout';

@look
export default class App extends Component {
  static propTypes = {
    children: PropTypes.any
  };
  static contextTypes = {
    _lookConfig: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className={styles.app}>
        {this.props.children}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  app: {
    height: '100vh',
    margin: 0,
    maxWidth: layoutStyle.maxWidth,
    padding: 0
  }
});

StyleSheet.addCSS({
  'html': {
    fontSize: '16px'
  },

  'body': {
    // TODO: Use tinycolor.mix() for Sass mix(theme.palette.c, #000, 40%),
    color: '#2F2C39',
    fontFamily: theme.typography.actionUISansSerif,
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: 'normal',
    margin: 0,
    padding: 0
  },

  'a': {
    color: theme.palette.b,
    textDecoration: 'none'
  },

  'a:hover, a:focus': {
    color: tinycolor(theme.palette.b).darken(15).toString(),
    textDecoration: 'underline'
  }
});

// Include font-awesome styles (and fonts) here for now:
if (typeof __WEBPACK__ !== 'undefined' && __WEBPACK__) {
  require('font-awesome/css/font-awesome.css');
}

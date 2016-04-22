import React, {PropTypes, Component} from 'react';
import { Presets, LookRoot, StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';
import layoutStyle from 'universal/styles/layout';

const config = Presets['react-dom'];

export default class App extends Component {
  static propTypes = {
    children: PropTypes.any
  }

  render() {
    return (
      <LookRoot config={config}>
        <div className={styles.app}>
          {this.props.children}
        </div>
      </LookRoot>
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
  },

  'a:hover, a:focus': {
    color: tinycolor(theme.palette.b).darken(15).toString(),
    textDecoration: 'underline'
  }
});

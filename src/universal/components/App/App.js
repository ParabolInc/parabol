import React, {PropTypes, Component} from 'react';
import { Presets, LookRoot, StyleSheet } from 'react-look';
import layoutStyle from 'universal/styles/layout';

import karlaBold from './fonts/Karla-Bold.ttf';
import karlaBoldItalic from './fonts/Karla-BoldItalic.ttf';
import karlaItalic from './fonts/Karla-Italic.ttf';
import karlaRegular from './fonts/Karla-Regular.ttf';

import merriweatherBlack from './fonts/Merriweather-Black.ttf';
import merriweatherBlackItalic from './fonts/Merriweather-BlackItalic.ttf';
import merriweatherBold from './fonts/Merriweather-Bold.ttf';
import merriweatherBoldItalic from './fonts/Merriweather-BoldItalic.ttf';
import merriweatherItalic from './fonts/Merriweather-Italic.ttf';
import merriweatherLight from './fonts/Merriweather-Light.ttf';
import merriweatherLightItalic from './fonts/Merriweather-LightItalic.ttf';
import merriweatherRegular from './fonts/Merriweather-Regular.ttf';

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
    color: '#222',
    fontFamily: 'Karla, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    height: '100vh',
    lineHeight: 'normal',
    margin: 0,
    maxWidth: layoutStyle.maxWidth,
    padding: 0
  }
});

StyleSheet.addCSS({
  'body :global': {
    fontSize: '16px',
    margin: 0
  }
});

StyleSheet.font(
  'Karla',
  [karlaBold, karlaBoldItalic, karlaItalic, karlaRegular]
);

StyleSheet.font(
  'Merriweather',
  [
    merriweatherBlack, merriweatherBlackItalic, merriweatherBold,
    merriweatherBoldItalic, merriweatherItalic, merriweatherLight,
    merriweatherLightItalic, merriweatherRegular
  ]
);

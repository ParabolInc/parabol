import React, {PropTypes, Component} from 'react';
import { Presets, LookRoot, StyleSheet } from 'react-look';
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
    maxWidth: layoutStyle.maxWidth,
    fontFamily: 'sans-serif',
    color: '#222',
    fontWeight: '100',
    fontSize: '1em', /* ~16px; */
    lineHeight: '1.375em', /* ~22px */
    margin: '0',
    padding: 0
  },

  /* TODO: where is this used? */
  component: {
    minHeight: '700px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
});

StyleSheet.addCSS({
   'body :global': {
     margin: 0
   }
})

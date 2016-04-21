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
  // TODO: Resolve: Was :global an artefact from CSS Modules? (TA)
  'body :global': {
    fontSize: '16px',
    margin: 0
  }
});

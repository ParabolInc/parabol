import React, {Component, PropTypes} from 'react';
import look, { StyleSheet } from 'react-look';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class WelcomeHeader extends Component {
  static propTypes = {
    children: PropTypes.any
  }

  render() {
    return (
      <div className={styles.root}>
        {this.props.children}
      </div>
    );
  }
}

styles = StyleSheet.create({
  root: {
    alignContent: 'center',
    display: 'flex !important',
    flex: '1',
    justifyContent: 'center',
    margin: '0 auto',
    maxWidth: '64rem',
    padding: '4rem',
    position: 'relative'
  }
});

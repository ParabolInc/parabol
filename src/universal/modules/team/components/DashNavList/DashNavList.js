import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import DashNavItem from '../DashNavItem/DashNavItem';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class DashNavList extends Component {

  static propTypes = {
    children: PropTypes.any,
    items: PropTypes.array
  }

  render() {
    return (
      <div className={styles.root}>
        {this.props.items.map((item, index) =>
          <div className={styles.item} key={index}>
            <DashNavItem active={item.active} label={item.label} />
          </div>
        )}
      </div>
    );
  }
}

styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  item: {
    padding: '0 0 .5rem'
  }
});

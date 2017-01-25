import {findDOMNode} from 'react-dom';
import React, {Component, PropTypes} from 'react';
import Menu from 'universal/modules/menu/components/Menu/Menu';

export default class MenuContainer extends Component {

  setPosition = (coords) => {
    this.setState(coords)
  };

  render() {
    return (
      <Menu
        {...this.props}
        coords={this.state}
        setPosition={this.setPosition}
      />
    );
  }
}

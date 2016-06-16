import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
// import {cashay} from 'cashay';

const mapStateToProps = () => {
  return {
    // meetingAndTeam: cashay.query(graphQuery, cashayOpts)
  };
};
@connect(mapStateToProps)
export default class WelcomeUser extends Component {
  static propTypes = {
    meetingAndTeam: PropTypes.object,
    params: PropTypes.object,
    dispatch: PropTypes.func
  }

  render() {
    const {userId} = this.props.params;
    return (
      <div>
        Please type in your name:
        <input type="text"/>
        <button>Next</button>
      </div>
    );
  }
}

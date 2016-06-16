import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
// import {cashay} from 'cashay';


const mapStateToProps = () => { // eslint-disable-line arrow-body-style
  return {
    // meetingAndTeam: cashay.query(graphQuery, cashayOpts)
  };
};
@connect(mapStateToProps)
// TODO: rewrite as stateless
// eslint-disable-next-line react/prefer-stateless-function
export default class WelcomeUser extends Component {
  static propTypes = {
    meetingAndTeam: PropTypes.object,
    params: PropTypes.object,
    dispatch: PropTypes.func
  }

  render() {
    const {userId} = this.props.params; // eslint-disable-line no-unused-vars
    return (
      <div>
        Please type in your name:
        <input type="text"/>
        <button>Next</button>
      </div>
    );
  }
}

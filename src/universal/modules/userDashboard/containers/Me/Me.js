import React, {Component, PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';


// eslint-disable-next-line react/prefer-stateless-function
@requireAuth
export default class Me extends Component {
  static propTypes = {
    meetingAndTeam: PropTypes.object,
    params: PropTypes.object,
    dispatch: PropTypes.func
  }

  render() {
    const {name, nickname} = this.props.auth.user;
    return (
      <div>
        It's the Me show! starring: <b>{name}</b>, AKA <b>{nickname}</b>
      </div>
    );
  }
}

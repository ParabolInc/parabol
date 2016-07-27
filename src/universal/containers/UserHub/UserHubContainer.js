import React from 'react';
import {cashay} from 'cashay';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {connect} from 'react-redux';
import UserHub from 'universal/components/UserHub/UserHub';

const mapStateToProps = () => ({user: cashay.query(getAuthQueryString, authedOptions).data.user});
const UserHubContainer = (props) => <UserHub {...props}/>;
export default connect(mapStateToProps)(UserHubContainer);

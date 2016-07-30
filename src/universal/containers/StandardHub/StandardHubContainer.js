import React from 'react';
import {cashay} from 'cashay';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {connect} from 'react-redux';
import StandardHub from 'universal/components/StandardHub/StandardHub';
import SettingsHub from 'universal/components/SettingsHub/SettingsHub';

const mapStateToProps = () => ({user: cashay.query(getAuthQueryString, authedOptions).data.user});
const StandardHubContainer = (props) => {
  const {picture, preferredName, email} = props.user;
  return (
    props.activeArea === 'settings' ?
    <SettingsHub /> :
    <StandardHub picture={picture} preferredName={preferredName} email={email}/>
  )
};
export default connect(mapStateToProps)(StandardHubContainer);

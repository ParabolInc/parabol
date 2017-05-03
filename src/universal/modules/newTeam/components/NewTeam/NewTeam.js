// import PropTypes from 'prop-types';
// import React from 'react';
// import withStyles from 'universal/styles/withStyles';
// import NewTeamFormContainer from 'universal/modules/newTeam/containers/NewTeamForm/NewTeamFormContainer';
// import {connect} from 'react-redux';
// import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
//
// const NewTeam = (props) => {
//   const {dispatch, match: {params: {newOrg}}} = props;
//   return (
//     <DashboardWrapper title="New Team | Parabol">
//       <NewTeamFormContainer dispatch={dispatch} newOrgRoute={Boolean(newOrg)} />
//     </DashboardWrapper>
//   );
// };
//
// NewTeam.propTypes = {
//   dispatch: PropTypes.func.isRequired,
//   match: PropTypes.shape({
//     params: PropTypes.shape({
//       newOrg: PropTypes.string
//     })
//   })
// };
//
// const styleThunk = () => ({
//   newTeamView: {
//     padding: '2rem'
//   }
// });
//
// export default withStyles(styleThunk)(NewTeam);

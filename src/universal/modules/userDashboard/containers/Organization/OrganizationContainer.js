import React, {Component, PropTypes} from 'react';
import Organization from 'universal/modules/userDashboard/components/Organization/Organization';

const organizationContainer = `
query {
  project @cached(type: "Project") {
    content
    createdBy
    id
    status
    teamMemberId
    updatedAt
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
    team @cached(type: "Team") {
      id
      name
    }
  }
  user @cached(type: "User") {
    id
  }
}
`;

const mapStateToProps = (state, props) => {
  const {params: {orgId}} = props;

  return {
    // org
  }
};

export default class OrganizationContainer extends Component {
  render() {
    const {org} = this.props;
    return (
      <Organization org={org}/>
    );
  }
};

// import React, {Component, PropTypes} from 'react';
// import {cashay} from 'cashay';
// import {Field, reduxForm, initialize} from 'redux-form';
// import labels from 'universal/styles/theme/labels';
// import OutcomeCardAssignMenuContainer
//   from 'universal/modules/teamDashboard/containers/OutcomeCardAssignMenu/OutcomeCardAssignMenuContainer';
//
// import OutcomeCard from 'OutcomeCard.js';
// import OutcomeCardTextarea from '../../../outcomeCard/components/OutcomeCardTextarea';
// import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
// import OutcomeCardFooter from '../../../outcomeCard/components/OutcomeCardFooter';
// import OutcomeCardStatusMenu from '../../../outcomeCard/components/OutcomeCardStatusMenu';
// import getOutcomeNames from 'universal/utils/getOutcomeNames';
//
// const OPEN_CONTENT_MENU = 'AgendaCard/openContentMenu';
// const OPEN_ASSIGN_MENU = 'AgendaCard/toggleAssignMenu';
// const OPEN_STATUS_MENU = 'AgendaCard/toggleStatusMenu';
//
// @reduxForm()
// export default class AgendaCard extends Component {
//   componentWillMount() {
//     const {outcome: {content}, dispatch, field, form} = this.props;
//     this.state = {
//       cardHasHover: false,
//       openMenu: OPEN_CONTENT_MENU
//     };
//     if (content) {
//       this.initializeValues(content);
//     }
//   }
//
//   componentWillReceiveProps(nextProps) {
//     const {content} = this.props.outcome;
//     const nextContent = nextProps.outcome.content;
//     if (nextContent !== content) {
//       this.initializeValues(nextContent);
//     }
//   }
//
//   onEnterTeamProjectCard = () => {
//     this.setState({cardHasHover: true});
//   }
//
//   onLeaveTeamProjectCard = () => {
//     this.setState({cardHasHover: false});
//   }
//
//   initializeValues(content) {
//     const {dispatch, form, outcome: {id}} = this.props;
//     dispatch(initialize(form, {[id]: content}));
//   }
//
//   toggleStatusMenu = () => {
//     const {openMenu} = this.state;
//     const nextOpenMenu = openMenu === OPEN_STATUS_MENU ? OPEN_CONTENT_MENU : OPEN_STATUS_MENU;
//     this.setState({openMenu: nextOpenMenu});
//   };
//
//   toggleAssignMenu = () => {
//     const {openMenu} = this.state;
//     const nextOpenMenu = openMenu === OPEN_ASSIGN_MENU ? OPEN_CONTENT_MENU : OPEN_ASSIGN_MENU;
//     this.setState({openMenu: nextOpenMenu});
//   };
//
//   closeMenu = () => {
//     this.setState({openMenu: OPEN_CONTENT_MENU});
//   };
//
//   render() {
//     const {openMenu} = this.state;
//     const {
//       form,
//       handleSubmit,
//       outcome,
//     } = this.props;
//     const {type, content, id: outcomeId} = outcome;
//     const isProject = type === 'Project';
//     const status = outcome.status || 'active';
//     const hasOpenStatusMenu = openMenu === OPEN_STATUS_MENU;
//     const hasOpenAssignMenu = openMenu === OPEN_ASSIGN_MENU;
//     const handleCardActive = (isActive) => {
//       if (isActive === undefined) {
//         return;
//       }
//       const [teamId] = outcomeId.split('::');
//       const editing = isActive ? `Task::${outcomeId}` : null;
//       const options = {
//         variables: {
//           teamId,
//           editing
//         }
//       };
//       cashay.mutate('edit', options);
//     };
//     const handleAgendaCardUpdate = (submittedData) => {
//       const submittedContent = submittedData[outcomeId];
//       if (!submittedContent) {
//         const {argName, mutationName} = getOutcomeNames(outcome, 'delete');
//         // delete blank cards
//         cashay.mutate(mutationName, {variables: {[argName]: outcomeId}});
//       } else {
//         // TODO debounce for useless things like ctrl, shift, etc
//         const {argName, mutationName} = getOutcomeNames(outcome, 'update');
//         const options = {
//           variables: {
//             [argName]: {
//               id: outcomeId,
//               content: submittedContent
//             }
//           }
//         };
//         cashay.mutate(mutationName, options);
//       }
//     };
//
//     return (
//       <OutcomeCard
//         isProject={isProject}
//         onEnterCard={this.onEnterTeamProjectCard}
//         onLeaveCard={this.onLeaveTeamProjectCard}
//         status={status}
//       >
//         {/* card main */}
//         {hasOpenAssignMenu &&
//           <OutcomeCardAssignMenuContainer
//             onComplete={this.closeMenu}
//             outcome={outcome}
//           />
//         }
//         {hasOpenStatusMenu &&
//           <OutcomeCardStatusMenu
//             isAgenda
//             isProject={isProject}
//             onComplete={this.closeMenu}
//             outcome={outcome}
//           />
//         }
//         {!hasOpenAssignMenu && !hasOpenStatusMenu &&
//           <div style={{width: '100%'}}>
//             <form>
//               <EditingStatusContainer
//                 form={form}
//                 outcomeId={outcome.id}
//                 updatedAt={outcome.updatedAt}
//               />
//               <Field
//                 cardHasHover={this.state.cardHasHover}
//                 component={OutcomeCardTextarea}
//                 handleActive={handleCardActive}
//                 handleSubmit={handleSubmit(handleAgendaCardUpdate)}
//                 isProject={isProject}
//                 name={outcomeId}
//                 outcome={outcome}
//                 doFocus={!content}
//               />
//             </form>
//           </div>
//         }
//         {/* card footer */}
//         <OutcomeCardFooter
//           cardHasHover={this.state.cardHasHover}
//           hasOpenStatusMenu={hasOpenStatusMenu}
//           isProject={isProject}
//           owner={outcome.teamMember}
//           status={status}
//           toggleAssignMenu={this.toggleAssignMenu}
//           handleStatusClick={this.toggleStatusMenu}
//         />
//       </OutcomeCard>
//     );
//   }
// }
//
// AgendaCard.propTypes = {
//   outcome: PropTypes.shape({
//     id: PropTypes.string,
//     content: PropTypes.string,
//     status: PropTypes.oneOf(labels.projectStatus.slugs),
//     teamMemberId: PropTypes.string,
//   }),
//   dispatch: PropTypes.func.isRequired,
//   form: PropTypes.string,
//   editors: PropTypes.array,
//   field: PropTypes.string,
//   focus: PropTypes.func,
//   hasOpenAssignMenu: PropTypes.bool,
//   hasOpenStatusMenu: PropTypes.bool,
//   isProject: PropTypes.bool,
//   owner: PropTypes.object,
//   teamMembers: PropTypes.array,
//   updatedAt: PropTypes.instanceOf(Date),
//   handleSubmit: PropTypes.func,
// };

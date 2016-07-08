import React, {Component} from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';
import AvatarContainer from './AvatarContainer';
import ButtonContainer from './ButtonContainer';
import CardContainer from './CardContainer';
import CardStageContainer from './CardStageContainer';
import ProjectCardContainer from './ProjectCardContainer';

// eslint-disable-next-line react/prefer-stateless-function
export default class PatternsContainer extends Component {
  render() {
    return (
      <div style={{margin: '0 auto', maxWidth: '80rem', padding: '2rem'}}>
        <Helmet title="Welcome to the Action Pattern Library" {...head} />

        <h1>Pattern Library</h1>

        <AvatarContainer />
        <ButtonContainer />
        <CardContainer />
        <CardStageContainer />
        <ProjectCardContainer />

      </div>
    );
  }
}

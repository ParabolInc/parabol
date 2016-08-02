import React, {Component} from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';

// import AvatarContainer from './AvatarContainer';
// import ButtonContainer from './ButtonContainer';
// import CardContainer from './CardContainer';
// import CardStageContainer from './CardStageContainer';
// import OutcomeCardContainer from './OutcomeCardContainer';

// eslint-disable-next-line react/prefer-stateless-function
export default class PatternsContainer extends Component {
  render() {
    return (
      <div style={{margin: '0 auto', maxWidth: '80rem', padding: '2rem'}}>
        <Helmet title="Welcome to the Action Pattern Library" {...head} />

        <h1>Pattern Library</h1>

        <ProgressBar />

        {/* <AvatarContainer />
        <ButtonContainer />
        <CardContainer />
        <CardStageContainer />
        <OutcomeCardContainer /> */}

      </div>
    );
  }
}

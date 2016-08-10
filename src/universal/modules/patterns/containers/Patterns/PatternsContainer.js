import React from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import OutcomeCardAssignMenu from 'universal/components/OutcomeCard/OutcomeCardAssignMenu';
import Type from 'universal/components/Type/Type';

// import AvatarContainer from './AvatarContainer';
// import ButtonContainer from './ButtonContainer';
// import CardContainer from './CardContainer';
// import CardStageContainer from './CardStageContainer';
// import OutcomeCardContainer from './OutcomeCardContainer';

const makeLabel = (string) =>
  <Type bold family="monospace" marginBottom="1rem" scale="s2">{'<'}{string}{' />'}</Type>;

const style = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const PatternsContainer = () =>
  <div style={style}>
    <Helmet title="Welcome to the Action Pattern Library" {...head} />

    <h1>Pattern Library</h1>

    {makeLabel('OutcomeCardAssignMenu')}
    <OutcomeCardAssignMenu />

    <br />
    <br />
    <br />

    {makeLabel('CreateCard')}
    <CreateCard />

    <br />
    <br />
    <br />

    {makeLabel('CreateCard hasControls')}
    <CreateCard hasControls />

    <br />
    <br />
    <br />

    {makeLabel('CreateCard createdBy="Marimar Suárez Peñalva" isCreating isProject={false}')}
    <CreateCard createdBy="Marimar Suárez Peñalva" isCreating isProject={false} />

    <br />
    <br />
    <br />

    {makeLabel('OutcomeCard hasOpenStatusMenu isArchived status="done"')}
    <OutcomeCard hasOpenStatusMenu isArchived status="done" />

    <br />
    <br />
    <br />

    {makeLabel('OutcomeCard content="Action completed in a day" isProject={false}')}
    <OutcomeCard content="Action completed in a day" isProject={false} />

    <br />
    <br />
    <br />

    {makeLabel('ProgressBar')}
    <ProgressBar />

    {/*
    <AvatarContainer />
    <ButtonContainer />
    <CardContainer />
    <CardStageContainer />
    <OutcomeCardContainer />
    */}

  </div>;

export default PatternsContainer;

import PropTypes from 'prop-types';
import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import Invoice from 'universal/modules/invoice/components/Invoice/Invoice';

const query = graphql`
  query InvoiceRootQuery($invoiceId: ID!) {
    viewer {
      ...Invoice_viewer
    }
  }
`;

const InvoiceRoot = ({atmosphere, match: {params: {invoiceId}}}) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{invoiceId}}
      render={({error, props: queryProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {queryProps && <AnimatedFade key="1">
              <Invoice viewer={queryProps.viewer} />
            </AnimatedFade>}
            {!queryProps && !error &&
            <AnimatedFade key="2" unmountOnExit exit={false}>
              <LoadingComponent height={'5rem'} />
            </AnimatedFade>
            }
          </TransitionGroup>
        );
      }}
    />
  );
};

InvoiceRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default withAtmosphere(InvoiceRoot);

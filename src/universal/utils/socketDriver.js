import socketCluster from 'socketcluster-client';
import AuthEngine from 'universal/redux/AuthEngine';

export default socketCluster.connect({}, {AuthEngine});

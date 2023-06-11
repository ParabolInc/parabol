import { collectDefaultMetrics, register } from 'prom-client';

// Enable default Node.js metrics
collectDefaultMetrics();

// Function to retrieve the metrics
export function getMetrics(): string {
  return register.metrics();
}

import { logger } from './logger';

interface Metrics {
  [key: string]: number;
}

const metrics: Metrics = {};

export function incrementMetric(name: string, value: number = 1) {
  metrics[name] = (metrics[name] || 0) + value;
}

export function setMetric(name: string, value: number) {
  metrics[name] = value;
}

export function getMetric(name: string): number {
  return metrics[name] || 0;
}

export function getAllMetrics(): Metrics {
  return { ...metrics };
}

export function resetMetrics() {
  Object.keys(metrics).forEach(key => delete metrics[key]);
}

export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
  }, 'Application error');
}

export function logWarning(message: string, context?: Record<string, unknown>) {
  logger.warn({
    message,
    context,
  }, 'Application warning');
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  logger.info({
    message,
    context,
  }, 'Application info');
}

// Simple performance tracking
export function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  return fn().finally(() => {
    const duration = Date.now() - startTime;
    logger.info({
      operation,
      duration,
    }, 'Operation completed');
    incrementMetric(`${operation}_duration_ms`, duration);
    incrementMetric(`${operation}_count`);
  });
}

// Simple health check metrics
export function recordHealthCheck(status: 'healthy' | 'unhealthy') {
  incrementMetric(`health_check_${status}`);
}

/**
 * runtimeOptions.js - Configuracion centralizada de runtime para Functions v2
 *
 * Mantener una sola region evita divergencias entre callables.
 * Los limites de instancias/concurrency ayudan a controlar costo y carga.
 */
export const REGION = 'us-central1';

export const CALLABLE_RUNTIME = {
  atomizeTask: {
    region: REGION,
    memory: '1GiB',
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 10,
    concurrency: 10,
  },
  generateReward: {
    region: REGION,
    memory: '512MiB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 10,
    concurrency: 20,
  },
  completeSession: {
    region: REGION,
    memory: '256MiB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 20,
  },
  getUserMetrics: {
    region: REGION,
    memory: '256MiB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 20,
  },
};

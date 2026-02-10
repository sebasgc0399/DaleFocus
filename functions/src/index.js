/**
 * index.js - Punto de entrada de Firebase Cloud Functions
 *
 * Exporta todas las Cloud Functions HTTP de DaleFocus:
 * - atomizeTask:     POST - Atomiza una tarea usando GPT-5.1
 * - completeSession: POST - Registra una sesion Pomodoro
 * - generateReward:  POST - Genera mensaje motivacional con GPT-5-mini
 * - getUserMetrics:  GET  - Calcula y devuelve metricas del usuario
 *
 * Runtime: Node.js 20 | Region: us-central1 | Gen2 Cloud Functions
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin SDK
initializeApp();
export const db = getFirestore();

// Exportar Cloud Functions
export { atomizeTask } from './atomizeTask.js';
export { completeSession } from './completeSession.js';
export { generateReward } from './generateReward.js';
export { getUserMetrics } from './getUserMetrics.js';

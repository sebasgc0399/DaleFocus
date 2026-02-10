/**
 * useFirestore.js - Hook personalizado para operaciones con Firestore
 *
 * Provee funciones reutilizables para interactuar con las colecciones
 * de Firestore: tasks, steps, sessions, users, metrics.
 *
 * Funcionalidades:
 * - Suscripcion en tiempo real a documentos/colecciones (onSnapshot)
 * - CRUD basico para tareas y pasos
 * - Consultas filtradas por usuario
 */
import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Hook para obtener las tareas del usuario en tiempo real
 *
 * @param {string} userId - ID del usuario autenticado
 * @returns {Object} { tasks, loading, error }
 */
export function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // TODO: Suscripcion en tiempo real a las tareas del usuario
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const taskList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(taskList);
        setLoading(false);
      },
      (err) => {
        console.error('Error en suscripcion de tareas:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { tasks, loading, error };
}

/**
 * Hook para obtener los pasos de una tarea especifica en tiempo real
 *
 * @param {string} taskId - ID de la tarea
 * @returns {Object} { steps, loading, error }
 */
export function useSteps(taskId) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) return;

    // TODO: Suscripcion en tiempo real a los pasos de la tarea
    const q = query(
      collection(db, 'steps'),
      where('taskId', '==', taskId),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const stepList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSteps(stepList);
        setLoading(false);
      },
      (err) => {
        console.error('Error en suscripcion de pasos:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [taskId]);

  return { steps, loading, error };
}

/**
 * Marca un paso como completado en Firestore
 *
 * @param {string} stepId - ID del paso
 */
export async function markStepCompleted(stepId) {
  // TODO: Actualizar el documento del paso
  await updateDoc(doc(db, 'steps', stepId), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
}

/**
 * Actualiza el estado de una tarea
 *
 * @param {string} taskId - ID de la tarea
 * @param {string} status - Nuevo estado ('active', 'completed', 'abandoned')
 */
export async function updateTaskStatus(taskId, status) {
  const updateData = { status };
  if (status === 'completed') {
    updateData.completedAt = serverTimestamp();
  }

  await updateDoc(doc(db, 'tasks', taskId), updateData);
}

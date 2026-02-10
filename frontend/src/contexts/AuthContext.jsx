/**
 * AuthContext.jsx - Contexto de Autenticacion
 *
 * Provee el estado de autenticacion del usuario a toda la app
 * usando Firebase Auth. Maneja:
 * - Estado del usuario actual (logueado o no)
 * - Funciones de login, registro y logout
 * - Listener de cambios en el estado de auth (onAuthStateChanged)
 *
 * Uso: envolver la app con <AuthProvider> y consumir con useAuth()
 */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { DEFAULT_POMODORO_CONFIG, PERSONALITIES } from '../utils/constants';

const AuthContext = createContext(null);

/**
 * Hook para consumir el contexto de autenticacion
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

/**
 * Provider de autenticacion
 * Escucha cambios en Firebase Auth y expone funciones de auth
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el estado de autenticacion
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // TODO: Cargar perfil del usuario desde Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data());
          }
        } catch (err) {
          console.error('Error cargando perfil:', err);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Registrar un nuevo usuario con email y password
   * Crea tambien su documento de perfil en Firestore
   */
  const register = async (email, password, displayName) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Crear documento de perfil en Firestore
    const profileData = {
      displayName: displayName || 'Usuario',
      personality: PERSONALITIES[0].id, // 'Coach Pro' por defecto
      pomodoroConfig: DEFAULT_POMODORO_CONFIG,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', credential.user.uid), profileData);
    setUserProfile(profileData);

    return credential.user;
  };

  /**
   * Iniciar sesion con email y password
   */
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  /**
   * Cerrar sesion
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

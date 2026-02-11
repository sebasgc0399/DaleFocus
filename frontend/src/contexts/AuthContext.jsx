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
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
  const didInitRef = useRef(false);

  // Escuchar cambios en el estado de autenticacion
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(
          profileRef,
          (profileDoc) => {
            setUserProfile(profileDoc.exists() ? profileDoc.data() : null);
          },
          (err) => {
            console.error('Error sincronizando perfil:', err);
            setUserProfile(null);
          },
        );
      } else {
        setUserProfile(null);
      }

      if (!didInitRef.current) {
        setLoading(false);
        didInitRef.current = true;
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  /**
   * Registrar un nuevo usuario con email y password
   * Crea tambien su documento de perfil en Firestore
   */
  const register = async (email, password, displayName) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const resolvedDisplayName = displayName?.trim() || email.split('@')[0] || 'Usuario';

    // Crear documento de perfil en Firestore
    const profileData = {
      displayName: resolvedDisplayName,
      personality: PERSONALITIES[0].id, // 'Coach Pro' por defecto
      pomodoroConfig: DEFAULT_POMODORO_CONFIG,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', credential.user.uid), profileData);

    try {
      await updateProfile(credential.user, { displayName: resolvedDisplayName });
    } catch (err) {
      // El perfil en Firestore sigue siendo la fuente de verdad.
      console.error('No se pudo actualizar displayName en Auth:', err);
    }

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

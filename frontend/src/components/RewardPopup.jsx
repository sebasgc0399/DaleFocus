/**
 * RewardPopup.jsx - Popup de Recompensa Motivacional
 *
 * Muestra un mensaje motivacional generado por GPT-5-mini
 * despues de completar un Pomodoro o finalizar un paso/tarea.
 * El tono se adapta a la personalidad elegida por el usuario
 * (Coach Pro, Pana Real, Sargento, Meme-Lord).
 *
 * Props:
 * - message (string): Mensaje motivacional generado por la IA
 *
 * Estados principales:
 * - isVisible: controla la animacion de entrada/salida
 */
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

function RewardPopup({ message }) {
  const { setRewardMessage } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  // Animacion de entrada al montar
  useEffect(() => {
    // Delay para activar la animacion CSS
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Cierra el popup con animacion de salida
   */
  const handleClose = () => {
    setIsVisible(false);
    // Esperar a que termine la animacion antes de desmontar
    setTimeout(() => {
      setRewardMessage(null);
    }, 300);
  };

  // Auto-cerrar despues de 6 segundos
  useEffect(() => {
    const autoClose = setTimeout(handleClose, 6000);
    return () => clearTimeout(autoClose);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300
          ${isVisible ? 'bg-opacity-40' : 'bg-opacity-0'}`}
        onClick={handleClose}
      />

      {/* Card de recompensa */}
      <div
        className={`relative bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full
                    text-center transform transition-all duration-300
                    ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* Icono de celebracion */}
        <span className="text-5xl block mb-4">&#127881;</span>

        {/* Mensaje motivacional */}
        <p className="text-lg font-medium text-gray-800 mb-6">
          {message}
        </p>

        {/* Boton cerrar */}
        <button onClick={handleClose} className="btn-primary">
          Seguir!
        </button>
      </div>
    </div>
  );
}

export default RewardPopup;

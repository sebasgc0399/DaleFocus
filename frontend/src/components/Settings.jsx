import { useApp } from '../contexts/AppContext';
import { Button } from './ui/Button';

function Settings() {
  const { goBack, canGoBack } = useApp();

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="mb-4 -ml-2"
            aria-label="Regresar a la pantalla anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Regresar
          </Button>
        )}
        <h2 className="text-2xl font-bold text-gray-800">Configuraciones</h2>
        <p className="text-gray-500 mt-1">Personaliza tu experiencia en DaleFocus</p>
      </div>

      <div className="text-center py-12 text-gray-400">
        <span className="text-4xl block mb-4">&#9881;</span>
        <p className="text-sm">Proximamente: personalidad del coach, duracion de pomodoros y mas.</p>
      </div>
    </div>
  );
}

export default Settings;

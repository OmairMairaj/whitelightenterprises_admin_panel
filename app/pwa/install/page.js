'use client';

import { useEffect, useState } from 'react';
import { FaMobileAlt, FaDownload } from 'react-icons/fa';
import UAParser from 'ua-parser-js';

const PwaInstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setIsIOS(result.os.name === 'iOS' || result.os.name === 'Mac OS');

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const checkInstallationStatus = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      } else {
        setIsInstalled(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    checkInstallationStatus();

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('El usuario aceptó el mensaje de A2HS');
          setIsInstalled(true);
          setIsVisible(false); // Ocultar el botón después de la instalación exitosa
        } else {
          console.log('El usuario rechazó el mensaje de A2HS');
        }
        setDeferredPrompt(null);
      });
    } else if (isIOS) {
      // Instrucciones específicas para la instalación en iOS
      alert(
        'Para instalar esta aplicación, toca el botón "Compartir" en Safari y luego "Agregar a la pantalla de inicio".'
      );
    }
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg p-6 shadow-lg dark:bg-zinc-800">
        <div className="flex flex-col items-center justify-center text-center">
          <FaMobileAlt className="mb-4 h-12 w-12 text-blue-500" />
          <h2 className="mb-2 text-2xl font-semibold">Instalar</h2>
          <p className="mb-4">Agregar a la pantalla de inicio</p>
          <button
            onClick={handleInstallClick}
            className="flex cursor-pointer items-center rounded-md bg-blue-500 px-4 py-2 text-white transition-all duration-300 ease-in-out hover:bg-blue-600"
            disabled={!deferredPrompt && !isIOS}
          >
            <FaDownload className="mr-2 h-5 w-5" />
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPage;

'use client';

import { useEffect, useState } from 'react';
import { FaMobileAlt, FaDownload, FaTimes } from 'react-icons/fa';
import UAParser from 'ua-parser-js';

const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);
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

    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1000);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      clearTimeout(timer);
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

  const handleCloseClick = () => {
    setIsVisible(false);
  };

  if (isInstalled || !showButton || !isVisible) {
    return null;
  }

  return (
    <div className="animate-slide-up fixed bottom-0 left-0 right-0 z-50 m-auto w-full translate-y-full transform opacity-0 transition-transform duration-500 ease-in-out md:w-1/2">
      <div className="flex w-full flex-row justify-end p-2">
        <button
          onClick={handleCloseClick}
          className="text-gray-500 transition-all duration-300 ease-in-out hover:text-gray-700"
        >
          <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      <div className="rounded-t-lg bg-white p-3 shadow-lg dark:bg-zinc-800 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaMobileAlt className="mr-2 h-6 w-6 text-blue-500 sm:mr-4 sm:h-10 sm:w-10" />
            <div>
              <h2 className="text-sm font-semibold sm:text-lg">Instalar</h2>
              <p className="text-xs text-gray-600 sm:text-base">
                Agregar a la pantalla de inicio
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="mr-2 flex cursor-pointer items-center rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition-all duration-300 ease-in-out hover:bg-blue-600 sm:px-4 sm:py-2 sm:text-base"
            disabled={!deferredPrompt && !isIOS}
          >
            <FaDownload className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallButton;

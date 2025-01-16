'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiPlay, FiPause } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';

const Pomodoro = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('Trabalho');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customTime, setCustomTime] = useState({
    trabalho: 25,
    pausaCurta: 5,
    pausaLonga: 15,
    sessoesPraLonga: 4
  });
  
  const settings = {
    trabalho: customTime.trabalho,
    pausaCurta: customTime.pausaCurta,
    pausaLonga: customTime.pausaLonga,
    sessoesPraLonga: customTime.sessoesPraLonga
  };

  const beep = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.connect(context.destination);
    oscillator.start();

    let beepCount = 0;
    const beepInterval = setInterval(() => {
      beepCount++;
      if (beepCount >= 15) {
        clearInterval(beepInterval);
        oscillator.stop();
      }
    }, 200);
  };

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            beep();
            handleSessionComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleSessionComplete = () => {
    if (sessionType === 'Trabalho') {
      setSessionsCompleted(prev => prev + 1);
      toast.success('Sessão de trabalho concluída!');
      
      if (sessionsCompleted + 1 >= settings.sessoesPraLonga) {
        setSessionType('Pausa Longa');
        setMinutes(settings.pausaLonga);
        setSessionsCompleted(0);
        toast('Hora da pausa longa!', { icon: '🎉' });
      } else {
        setSessionType('Pausa Curta');
        setMinutes(settings.pausaCurta);
        toast('Hora da pausa curta!', { icon: '☕' });
      }
    } else {
      setSessionType('Trabalho');
      setMinutes(settings.trabalho);
      toast('Hora de voltar ao trabalho!', { icon: '💪' });
    }
    setSeconds(0);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    toast(isActive ? 'Timer pausado' : 'Timer iniciado', {
      icon: isActive ? '⏸️' : '▶️',
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Atualiza a cor do fundo do body
    document.body.className = isDarkMode ? 'bg-gray-100' : 'bg-gray-900';
  };

  const handleTimeChange = (type, value) => {
    setCustomTime(prev => ({
      ...prev,
      [type]: parseInt(value) || 0
    }));
    
    if (!isActive) {
      if (type === 'trabalho' && sessionType === 'Trabalho') {
        setMinutes(parseInt(value) || 0);
      } else if (type === 'pausaCurta' && sessionType === 'Pausa Curta') {
        setMinutes(parseInt(value) || 0);
      } else if (type === 'pausaLonga' && sessionType === 'Pausa Longa') {
        setMinutes(parseInt(value) || 0);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-11/12 md:max-w-md mx-auto my-4 md:my-8 p-4 md:p-8 text-center rounded-lg shadow-lg backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'}`}
    >
      <Toaster position="top-right" />
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-2 md:p-3 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
      >
        {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </motion.button>

      <motion.h2 
        className="text-xl md:text-2xl font-bold mb-4 md:mb-6"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Pomodoro Timer
      </motion.h2>
      
      <motion.div 
        className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 font-mono"
        animate={{ opacity: isActive ? [1, 0.7, 1] : 1 }}
        transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </motion.div>
      
      <div className="mb-4 md:mb-6">
        <p className="mb-2 text-base md:text-lg">Sessão atual: {sessionType}</p>
        <p className="text-base md:text-lg">Sessões completadas: {sessionsCompleted}</p>
      </div>

      <div className="mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tempo de Trabalho (min)</label>
          <input
            type="number"
            value={customTime.trabalho}
            onChange={(e) => handleTimeChange('trabalho', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            min="1"
            disabled={isActive}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pausa Curta (min)</label>
          <input
            type="number"
            value={customTime.pausaCurta}
            onChange={(e) => handleTimeChange('pausaCurta', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            min="1"
            disabled={isActive}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pausa Longa (min)</label>
          <input
            type="number"
            value={customTime.pausaLonga}
            onChange={(e) => handleTimeChange('pausaLonga', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            min="1"
            disabled={isActive}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sessões até Pausa Longa</label>
          <input
            type="number"
            value={customTime.sessoesPraLonga}
            onChange={(e) => handleTimeChange('sessoesPraLonga', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            min="1"
            disabled={isActive}
          />
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTimer}
        className={`px-6 md:px-8 py-2 md:py-3 text-base md:text-lg rounded-lg transition-colors flex items-center justify-center gap-2 w-full ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
      >
        {isActive ? <><FiPause /> Pausar</> : <><FiPlay /> Começar</>}
      </motion.button>
    </motion.div>
  );
};

export default Pomodoro;
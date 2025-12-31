import { useState, useEffect, useRef } from 'react';
import './App.css';

const translations = {
  de: {
    title: "Radionik ES",
    subtitle: "Online Tongenerator",
    play: "Ton abspielen",
    stop: "Stoppen",
    volume: "Lautstärke",
    waveform: "Klangfarbe",
    presets: "Gespeicherte Favoriten",
    savePreset: "Aktuelle Einstellung speichern",
    load: "Laden",
    delete: "Löschen",
    warning: "⚠️ Hinweis: Bitte achten Sie auf eine angenehme Lautstärke.",
    octaveDown: "Oktave tiefer",
    octaveUp: "Oktave höher",
    desc: "Tipp: Nutzen Sie die Leertaste für Start/Stopp und die Pfeiltasten zur Feinjustierung.",
    onAir: "AKTIV",
    off: "BEREIT",
    // Timer
    timerTitle: "Schlummertimer (Auto-Stopp)",
    timerRunning: "Timer läuft:",
    timerMin: "Min.",
    stopTimer: "Timer abbrechen",
    customTimePlaceholder: "Minuten eingeben...",
    startTimerBtn: "Start",
    // FAQ Section
    faqTitle: "Wofür kann ich diesen Tongenerator nutzen?",
    faq1_title: "Instrumente stimmen & Audio-Tests",
    faq1_text: "Ideal zum Stimmen von Instrumenten, für physikalische Experimente (Resonanzfrequenzen) oder zum Testen von Audio-Equipment (z.B. Subwoofer).",
    faq2_title: "Tinnitus-Frequenzabgleich",
    faq2_text: "Wenn Sie einen tonalen Tinnitus haben, kann dieser Generator helfen, die Frequenz zu bestimmen. Dies ist nützlich für Maskierungstherapien. Prüfen Sie immer auch eine Oktave höher (Frequenz × 2) oder tiefer (Frequenz × ½), da diese oft verwechselt werden.",
    faq3_title: "Forschung: 40 Hz & Alzheimer",
    faq3_text: "Wissenschaftler (u.a. MIT) untersuchen, ob 40-Hz-Töne molekulare Veränderungen im Gehirn beeinflussen können. Studien laufen noch. Wichtig: Dies ist kein zertifiziertes Medizinprodukt – wir garantieren keine heilende Wirkung.",
  },
  es: {
    title: "Radionik ES",
    subtitle: "Generador de Tonos",
    play: "Reproducir Tono",
    stop: "Detener",
    volume: "Volumen",
    waveform: "Timbre",
    presets: "Favoritos Guardados",
    savePreset: "Guardar configuración actual",
    load: "Cargar",
    delete: "Borrar",
    warning: "⚠️ Nota: Por favor, mantenga un volumen cómodo.",
    octaveDown: "Octava baja",
    octaveUp: "Octava alta",
    desc: "Consejo: Use la barra espaciadora para iniciar/parar y las flechas para ajustar.",
    onAir: "ACTIVO",
    off: "LISTO",
    // Timer
    timerTitle: "Temporizador (Auto-Stop)",
    timerRunning: "Tiempo restante:",
    timerMin: "Min.",
    stopTimer: "Cancelar temporizador",
    customTimePlaceholder: "Ingresar minutos...",
    startTimerBtn: "Inicio",
    // FAQ Section
    faqTitle: "¿Para qué puedo usar este generador?",
    faq1_title: "Afinación y Pruebas de Audio",
    faq1_text: "Ideal para afinar instrumentos, experimentos de ciencia (resonancia) o probar equipos de audio (subwoofers).",
    faq2_title: "Coincidencia de frecuencia de Tinnitus",
    faq2_text: "Si tiene tinnitus tonal, esto ayuda a determinar su frecuencia para terapias de enmascaramiento. Verifique siempre una octava más alta (frecuencia × 2) o más baja (× ½), ya que es fácil confundirlas.",
    faq3_title: "Investigación: 40 Hz y Alzheimer",
    faq3_text: "Científicos (MIT) investigan si los tonos de 40 Hz afectan cambios moleculares en el cerebro. Los estudios continúan. Nota: Este no es un dispositivo médico certificado – no garantizamos resultados médicos.",
  }
};

function App() {
  const [lang, setLang] = useState('de');
  const t = translations[lang];

  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(0.5);
  const [waveType, setWaveType] = useState('sine');
  
  // Timer States
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('tone-presets');
    return saved ? JSON.parse(saved) : [
      { freq: 440, type: 'sine', name: 'Standard A (440 Hz)' },
      { freq: 528, type: 'sine', name: 'Entspannung (528 Hz)' }
    ];
  });

  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      gainNodeRef.current = audioCtxRef.current.createGain();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 10000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      if (isPlaying) togglePlay(); 
      setIsTimerRunning(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, isPlaying]);

  const startTimer = (minutes) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
    setCustomMinutes(''); // Reset Input field
  };

  const handleCustomTimerStart = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0) {
      startTimer(mins);
    }
  };

  const cancelTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.fillStyle = '#f0f2f5'; 
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 4;
      canvasCtx.strokeStyle = '#004d40'; 
      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };
    draw();
  };

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = '#f0f2f5';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#b0bec5';
        ctx.moveTo(0, canvasRef.current.height/2);
        ctx.lineTo(canvasRef.current.width, canvasRef.current.height/2);
        ctx.stroke();
      }
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
      oscillatorRef.current.type = waveType;
    }
  }, [frequency, waveType]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    if (isPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } else {
      oscillatorRef.current = audioCtxRef.current.createOscillator();
      oscillatorRef.current.type = waveType;
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
      oscillatorRef.current.connect(gainNodeRef.current);
      oscillatorRef.current.start();
    }
    setIsPlaying(!isPlaying);
  };

  const savePreset = () => {
    const newPreset = { freq: frequency, type: waveType, name: `${frequency}Hz - ${waveType}` };
    const newPresets = [...presets, newPreset];
    setPresets(newPresets);
    localStorage.setItem('tone-presets', JSON.stringify(newPresets));
  };

  const removePreset = (index) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    localStorage.setItem('tone-presets', JSON.stringify(newPresets));
  };

  const adjustFreq = (amount) => setFrequency(f => {
    const newFreq = parseFloat((f + amount).toFixed(2));
    return Math.max(1, Math.min(20000, newFreq));
  });

  const multFreq = (factor) => setFrequency(f => Math.max(1, Math.min(20000, parseFloat((f * factor).toFixed(2)))));

  return (
    <div className="app-container">
      <div className="lang-switch">
        <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>Deutsch</button>
        <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>Español</button>
      </div>

      <header>
        <h1 className="main-title">{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <main className="card">
        <div className="visualizer-container">
            <canvas ref={canvasRef} width="600" height="100" className="visualizer"></canvas>
        </div>

        <div className="display-section">
          <div className="frequency-wrapper">
            <input 
              type="number" 
              inputMode="decimal"
              value={frequency} 
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="freq-input"
            />
            <span className="unit">Hertz</span>
          </div>
        </div>

        <button className={`play-btn ${isPlaying ? 'stop' : 'play'}`} onClick={togglePlay}>
          {isPlaying ? t.stop : t.play}
        </button>

        <div className="slider-container">
          <input 
            type="range" min="20" max="10000" step="0.01" 
            value={frequency} 
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="slider freq-slider"
            aria-label="Frequenz"
          />
        </div>

        <div className="fine-tuning">
          <button onClick={() => multFreq(0.5)}>× ½</button>
          <button onClick={() => adjustFreq(-0.01)}>- 0.01</button>
          <button onClick={() => adjustFreq(0.01)}>+ 0.01</button>
          <button onClick={() => multFreq(2)}>× 2</button>
        </div>

        <div className="fine-tuning" style={{ marginTop: '12px' }}>
            <button onClick={() => setFrequency(234.45)}>234.45 Hz</button>
            <button onClick={() => setFrequency(40)} style={{ gridColumn: 'span 2' }}>40 Hz (Forschung)</button>
            <button onClick={() => adjustFreq(10)}>+ 10</button>
        </div>

        <hr className="divider" />

        <div className="settings-grid">
          <div className="control-group">
            <label>{t.waveform}</label>
            <div className="wave-selector">
              {['sine', 'square', 'sawtooth', 'triangle'].map(type => (
                <button 
                  key={type}
                  className={waveType === type ? 'active' : ''}
                  onClick={() => setWaveType(type)}
                >
                  {type === 'sine' ? 'Sinus' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>{t.volume}</label>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="slider volume-slider"
              aria-label="Lautstärke"
            />
            <p className="info-text">{t.warning}</p>
          </div>
        </div>
        
        {/* TIMER SECTION */}
        <div className="timer-section">
          <h4>{t.timerTitle}</h4>
          {!isTimerRunning ? (
            <>
              <div className="timer-controls">
                <button onClick={() => startTimer(1)}>1 {t.timerMin}</button>
                <button onClick={() => startTimer(5)}>5 {t.timerMin}</button>
                <button onClick={() => startTimer(15)}>15 {t.timerMin}</button>
                <button onClick={() => startTimer(30)}>30 {t.timerMin}</button>
                <button onClick={() => startTimer(45)}>45 {t.timerMin}</button>
                <button onClick={() => startTimer(60)}>60 {t.timerMin}</button>
              </div>
              <div className="timer-custom">
                <input 
                  type="number" 
                  min="1" 
                  placeholder={t.customTimePlaceholder}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                />
                <button onClick={handleCustomTimerStart}>{t.startTimerBtn}</button>
              </div>
            </>
          ) : (
            <div className="timer-display">
              <span className="time-remaining">{t.timerRunning} <strong>{formatTime(timerSeconds)}</strong></span>
              <button className="cancel-timer-btn" onClick={cancelTimer}>{t.stopTimer}</button>
            </div>
          )}
        </div>

        <div className="presets-section">
          <h4>{t.presets}</h4>
          <button className="save-btn" onClick={savePreset}>
            + {t.savePreset}
          </button>
          <div className="preset-list">
            {presets.map((p, i) => (
              <div key={i} className="preset-item">
                <span onClick={() => { setFrequency(p.freq); setWaveType(p.type); }}>
                  <span className="preset-freq">{p.freq} Hz</span> 
                  <span className="preset-type">({p.type})</span>
                </span>
                <button className="delete-btn" onClick={() => removePreset(i)} aria-label="Löschen">✕</button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <section className="faq-section">
        <h3>{t.faqTitle}</h3>
        <div className="faq-item">
          <h4>{t.faq1_title}</h4>
          <p>{t.faq1_text}</p>
        </div>
        <div className="faq-item">
          <h4>{t.faq2_title}</h4>
          <p>{t.faq2_text}</p>
        </div>
        <div className="faq-item">
          <h4>{t.faq3_title}</h4>
          <p>{t.faq3_text}</p>
        </div>
      </section>

      <p className="footer-note">{t.desc}</p>
    </div>
  );
}

export default App;
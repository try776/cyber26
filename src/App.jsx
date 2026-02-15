import { useState, useEffect, useRef } from 'react';
import './App.css';

// Amplify UI Imports
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const translations = {
  de: {
    title: "Radionik ES",
    subtitle: "Professioneller Multi-Frequenz Generator",
    introTitle: "Willkommen bei Radionik ES",
    introText: "Erzeugen Sie präzise Hertz-Frequenzen für Therapie-Ansätze. Es wird ein Skalar-Generator benötigt.",
    safetyTitle: "Wichtiger Sicherheitshinweis",
    safetyText: "Hohe Frequenzen und Lautstärken können Gehör und Lautsprecher beschädigen. Starten Sie immer mit geringer Lautstärke.",
    addInstance: "+ Neuen Generator öffnen",
    play: "Start",
    stop: "Stopp",
    volume: "Vol",
    balance: "Bal",
    waveform: "Welle",
    removeInstance: "Kachel schließen",
    downloadsTitle: "Dokumente & Anleitungen",
    downloadBtn: "Download",
    warning: "⚠️ Lautstärke beachten",
    timerTitle: "Timer",
    timerRunning: "Restzeit:",
    startTimerBtn: "Start",
    cancelTimer: "X",
    minShort: "min",
    signOut: "Abmelden",
    zAppTitle: "Z-App & Skalar-Therapie",
    zAppText: "Ihr Frequenzgenerator für PC, Tablet oder Smartphone. Mit der Z-App können Sie Belastungen analysieren und direkt auf den Skalargenerator übertragen.",
    scalarInfo: "Für die Therapie ist ein Skalargenerator als Übertragungsmedium erforderlich.",
    storeBtnAndroid: "Google Play Store",
    storeBtnIOS: "Apple App Store",
    faqTitle: "Häufige Anwendungsbereiche",
    faq1_title: "Instrumente & Audio-Tests",
    faq1_text: "Ideal zum Stimmen von Instrumenten (Kammerton A 440Hz/432Hz).",
    faq3_title: "Binaurale Beats & Gehirnwellen",
    faq3_text: "Nutzen Sie zwei Kacheln mit leicht unterschiedlichen Frequenzen.",
    searchTitle: "Frequenz-Datenbank durchsuchen"
  },
  es: {
    title: "Radionik ES",
    subtitle: "Generador Multi-Frecuencia Profesional",
    introTitle: "Bienvenido a Radionik ES",
    introText: "Genere frecuencias de audio precisas para análisis acústico y terapia.",
    safetyTitle: "Aviso de Seguridad",
    safetyText: "Las frecuencias altas y el volumen alto pueden dañar el oído.",
    addInstance: "+ Añadir Generador",
    play: "Incio",
    stop: "Parar",
    volume: "Vol",
    balance: "Bal",
    waveform: "Onda",
    removeInstance: "Cerrar panel",
    downloadsTitle: "Documentos",
    downloadBtn: "Descargar",
    warning: "⚠️ Cuidado con el volumen",
    timerTitle: "Temporizador",
    timerRunning: "Restante:",
    startTimerBtn: "Inicio",
    cancelTimer: "X",
    minShort: "min",
    signOut: "Cerrar sesión",
    zAppTitle: "Z-App y Terapia Escalar",
    zAppText: "Generador de frecuencias para PC, tableta o móvil.",
    scalarInfo: "Para la terapia se necesita un generador escalar.",
    storeBtnAndroid: "Google Play Store",
    storeBtnIOS: "Apple App Store",
    faqTitle: "¿Usos del generador?",
    faq1_title: "Afinación y Audio",
    faq1_text: "Para afinar instrumentos y pruebas de audio profesional.",
    faq3_title: "Pulsos Binaurales",
    faq3_text: "Use dos paneles para ritmos binaurales.",
    searchTitle: "Buscar en la base de datos de frecuencias"
  }
};

const documents = [
  { 
    id: 1, 
    name: "Full List Royal Rife Frequencies.pdf", 
    size: "4.8 MB",
    url: "https://imagestoragesatellite.s3.eu-north-1.amazonaws.com/Full+List+Royal+Rife+Frequencies.pdf"
  },
  { 
    id: 2, 
    name: "DNA-related Pathogen Frequency Sets.pdf", 
    size: "5 MB",
    url: "https://imagestoragesatellite.s3.eu-north-1.amazonaws.com/new_a5_The%2BDNA-related%2BPathogen%2BFrequency%2BSets_v1.pdf"
  },
  {
    id: 3,
    name: "Z-App Sequences List.pdf",
    size: "2.1 MB",
    url: "https://zappkit.com/wp-content/uploads/2024/11/ZAppSequences-1.pdf"
  }
];

// --- INDIVIDUAL TONE GENERATOR COMPONENT ---
function ToneInstance({ id, onRemove, t, initialFreq }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(initialFreq);
  const [volume, setVolume] = useState(0.3);
  const [pan, setPan] = useState(0);
  const [waveType, setWaveType] = useState('sine');

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const pannerRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Init Audio Context
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const newCtx = new AudioContext();
    audioCtxRef.current = newCtx;

    const newGain = newCtx.createGain();
    gainNodeRef.current = newGain;

    let newPanner;
    if (newCtx.createStereoPanner) {
      newPanner = newCtx.createStereoPanner();
    } else {
      newPanner = newCtx.createGain();
    }
    pannerRef.current = newPanner;

    const newAnalyser = newCtx.createAnalyser();
    newAnalyser.fftSize = 1024;
    analyserRef.current = newAnalyser;

    newGain.connect(newPanner);
    newPanner.connect(newAnalyser);
    newAnalyser.connect(newCtx.destination);

    newGain.gain.value = volume;
    if (newPanner.pan) newPanner.pan.value = pan;

    return () => {
      if (newCtx.state !== 'closed') {
        newCtx.close().catch(e => console.error(e));
      }
      audioCtxRef.current = null;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(p => p - 1), 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      stopSound();
      setIsTimerRunning(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (mins) => {
    setTimerSeconds(mins * 60);
    setIsTimerRunning(true);
    setCustomMinutes('');
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = isPlaying ? '#00796b' : '#e2e8f0';
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  };

  useEffect(() => {
    if (isPlaying) drawVisualizer();
    else if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  useEffect(() => {
    if (oscillatorRef.current && audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      oscillatorRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.02);
      oscillatorRef.current.type = waveType;
    }
  }, [frequency, waveType]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume]);

  useEffect(() => {
    if (pannerRef.current?.pan && audioCtxRef.current) {
      pannerRef.current.pan.setTargetAtTime(pan, audioCtxRef.current.currentTime, 0.05);
    }
  }, [pan]);

  const startSound = () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    if (audioCtxRef.current.state === 'closed') return;

    oscillatorRef.current = audioCtxRef.current.createOscillator();
    oscillatorRef.current.type = waveType;
    oscillatorRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    oscillatorRef.current.connect(gainNodeRef.current);

    gainNodeRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
    gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1);

    oscillatorRef.current.start();
    setIsPlaying(true);
  };

  const stopSound = () => {
    if (oscillatorRef.current && audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      const ct = audioCtxRef.current.currentTime;
      gainNodeRef.current.gain.cancelScheduledValues(ct);
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ct);
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ct + 0.1);

      const osc = oscillatorRef.current;
      osc.stop(ct + 0.1);
      setTimeout(() => { try { osc.disconnect(); } catch (e) { } }, 150);
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => isPlaying ? stopSound() : startSound();
  const adjustFreq = (amt) => setFrequency(f => Math.max(1, Math.min(150000, parseFloat((f + amt).toFixed(2)))));
  const multFreq = (fac) => setFrequency(f => Math.max(1, Math.min(150000, parseFloat((f * fac).toFixed(2)))));

  return (
    <div className="tile-card">
      <div className="tile-header">
        <div className="visualizer-wrapper">
          <canvas ref={canvasRef} width="300" height="60"></canvas>
        </div>
        <button className="remove-btn" onClick={() => onRemove(id)} title={t.removeInstance}>✕</button>
      </div>

      <div className="tile-controls">
        <div className="freq-display-small">
          <input
            type="number" value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
          <span className="unit-small">Hz</span>
        </div>

        <div className="main-actions">
          <button className={`play-btn-small ${isPlaying ? 'stop' : ''}`} onClick={togglePlay}>
            {isPlaying ? t.stop : t.play}
          </button>
        </div>

        <input
          type="range" min="20" max="100000" step="1"
          value={frequency} onChange={(e) => setFrequency(Number(e.target.value))}
          className="slider-small"
        />

        <div className="fine-tune-grid">
          <button onClick={() => multFreq(0.5)}>½</button>
          <button onClick={() => adjustFreq(-1)}>-1</button>
          <button onClick={() => adjustFreq(1)}>+1</button>
          <button onClick={() => multFreq(2)}>2×</button>
        </div>

        <div className="params-row">
          <div className="param-col">
            <label>{t.volume}</label>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
          </div>
          <div className="param-col">
            <label>{t.balance}</label>
            <input type="range" min="-1" max="1" step="0.1" value={pan} onChange={e => setPan(parseFloat(e.target.value))} />
          </div>
        </div>

        <div className="waveform-mini">
          {['sine', 'square', 'sawtooth', 'triangle'].map(type => (
            <button key={type} className={waveType === type ? 'active' : ''} onClick={() => setWaveType(type)}>
              {type === 'sine' ? '∿' : type.substring(0, 2)}
            </button>
          ))}
        </div>

        <div className="mini-timer">
          {!isTimerRunning ? (
            <>
              <button onClick={() => startTimer(15)}>15{t.minShort}</button>
              <button onClick={() => startTimer(30)}>30{t.minShort}</button>
              <input
                type="number" placeholder="Min..."
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                className="timer-input-mini"
              />
              {customMinutes && <button className="timer-go-btn" onClick={() => startTimer(Number(customMinutes))}>Go</button>}
            </>
          ) : (
            <div className="timer-running-badge">
              ⏳ {Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? '0' : ''}{timerSeconds % 60}
              <button onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}>✕</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [lang, setLang] = useState('de');
  const t = translations[lang];
  const [instances, setInstances] = useState([{ id: Date.now(), freq: 440 }]);

  const addInstance = () => {
    const lastFreq = instances[instances.length - 1]?.freq || 440;
    setInstances([...instances, { id: Date.now(), freq: lastFreq }]);
  };

  const removeInstance = (id) => {
    if (instances.length > 1) {
      setInstances(instances.filter(inst => inst.id !== id));
    }
  };

  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <div className="app-container">
          <div className="top-bar">
            <div className="branding">
              <h1 className="logo">Radionik ES</h1>
              <span className="version-tag">v2.4</span>
            </div>
            <div className="lang-switch">
              <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
              <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
              <button onClick={signOut} className="signout-btn">{t.signOut}</button>
            </div>
          </div>

          <div className="hero-section">
            <h2>{t.subtitle}</h2>
            <p className="intro-text">{t.introText}</p>
            <div className="alert-box">
              <strong>{t.safetyTitle}:</strong> {t.safetyText}
            </div>

            <div className="action-bar">
              <button className="add-btn" onClick={addInstance}>{t.addInstance}</button>
            </div>
          </div>

          <div className="tiles-grid">
            {instances.map((inst) => (
              <ToneInstance
                key={inst.id}
                id={inst.id}
                initialFreq={inst.freq}
                onRemove={removeInstance}
                t={t}
              />
            ))}
          </div>

          <div className="global-sections">
            
            {/* --- NEUE SUCHFUNKTION ALS IFRAME --- */}
            <section className="search-section" style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '15px' }}>{t.searchTitle}</h3>
              <iframe 
                src="https://pdfsearchv1.digi4.click/" 
                width="100%" 
                height="650px" 
                style={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: 'transparent' }} 
                title="PDF Suche"
              ></iframe>
            </section>

            <section className="zapp-section">
              <h3>{t.zAppTitle}</h3>
              <p className="zapp-intro">{t.zAppText}</p>
              <div className="store-buttons">
                <a href="https://play.google.com/store/apps/details/Z_App_Rife_App?id=com.zappkit.zappid&hl=de_CH" target="_blank" rel="noopener noreferrer" className="store-btn android">
                  🤖 {t.storeBtnAndroid}
                </a>
                <a href="https://apps.apple.com/us/app/z-app/id1509263287" target="_blank" rel="noopener noreferrer" className="store-btn ios">
                  🍎 {t.storeBtnIOS}
                </a>
              </div>
              <div className="scalar-info-box">
                <span className="info-icon">📡</span>
                <p>{t.scalarInfo}</p>
              </div>
            </section>

            <section className="faq-section">
              <h3>{t.faqTitle}</h3>
              <div className="faq-grid">
                <div className="faq-item">
                  <h4>{t.faq1_title}</h4>
                  <p>{t.faq1_text}</p>
                </div>
                <div className="faq-item">
                  <h4>{t.faq3_title}</h4>
                  <p>{t.faq3_text}</p>
                </div>
              </div>
            </section>

            <div className="downloads-section">
              <h4>{t.downloadsTitle}</h4>
              <div className="files-list">
                {documents.map(doc => (
                  <div key={doc.id} className="file-item">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <span className="file-name">{doc.name}</span>
                      <span className="file-size">{doc.size}</span>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="download-btn-small">
                      {t.downloadBtn}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="footer">
            &copy; {new Date().getFullYear()} Radionik ES. All rights reserved.
          </footer>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
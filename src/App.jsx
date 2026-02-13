import { useState, useEffect, useRef } from 'react';
import './App.css';

const translations = {
  de: {
    title: "Radionik ES",
    subtitle: "Professioneller Multi-Frequenz Generator",
    introTitle: "Willkommen bei Radionik ES",
    introText: "Erzeugen Sie präzise Hertz-Frequenzen für Therapie-Ansätze. Es wird ein Skalar-Generator benötigt. Es können auch mehrer Frequenzen gleichzeitig angewendet werden.",
    safetyTitle: "Wichtiger Sicherheitshinweis",
    safetyText: "Hohe Frequenzen und Lautstärken können Gehör und Lautsprecher beschädigen. Starten Sie immer mit geringer Lautstärke. Bitte beachten Sie zudem: Der Stumm-Modus an Ihrem Smartphone muss ausgeschaltet sein, damit die Tonausgabe funktioniert.",
    addInstance: "+ Neuen Generator öffnen",
    play: "Start",
    stop: "Stopp",
    volume: "Vol",
    balance: "Bal",
    waveform: "Welle",
    removeInstance: "Kachel schließen",
    rifeLabel: "Rife & Solfeggio Presets",
    rifePlaceholder: "Suchen (z.B. Schmerz)...",
    downloadsTitle: "Dokumente & Anleitungen",
    downloadBtn: "Download",
    warning: "⚠️ Lautstärke beachten",
    timerTitle: "Timer",
    timerRunning: "Restzeit:",
    startTimerBtn: "Start",
    cancelTimer: "X",
    minShort: "min",
    openSearch: "🔍 Preset suchen / Liste öffnen",
    closeSearch: "Liste schließen",
    // Z-App & Scalar Info
    zAppTitle: "Z-App & Skalar-Therapie",
    zAppText: "Ihr Frequenzgenerator für PC, Tablet oder Smartphone. Mit der Z-App können Sie Belastungen analysieren und direkt auf den Skalargenerator übertragen. Sollte eine Frequenz in der App nicht verfügbar sein, können Sie diesen Generator nutzen.",
    scalarInfo: "Für die Therapie ist ein Skalargenerator als Übertragungsmedium erforderlich. Platzieren Sie eine Haarprobe oder ein Haarfläschchen auf dem Gerät, um jede beliebige Frequenz über die Ferne zu übertragen. Weitere Informationen erhalten Sie in unseren Seminaren und Kursen.",
    storeBtnAndroid: "Google Play Store",
    storeBtnIOS: "Apple App Store",
    // FAQ
    faqTitle: "Häufige Anwendungsbereiche",
    faq1_title: "Instrumente & Audio-Tests",
    faq1_text: "Ideal zum Stimmen von Instrumenten (Kammerton A 440Hz/432Hz), für Resonanzexperimente in der Physik oder zum Testen von Subwoofern.",
    faq3_title: "Binaurale Beats & Gehirnwellen",
    faq3_text: "Nutzen Sie zwei Kacheln mit leicht unterschiedlichen Frequenzen (z.B. 400Hz links und 410Hz rechts), um im Gehirn eine Phantom-Schwingung von 10Hz (Alpha-Wellen) zu erzeugen.",
  },
  es: {
    title: "Radionik ES",
    subtitle: "Generador Multi-Frecuencia Profesional",
    introTitle: "Bienvenido a Radionik ES",
    introText: "Genere frecuencias de audio precisas para análisis acústico, terapia o afinación de instrumentos. Utilice la función de ventanas múltiples para ritmos binaurales.",
    safetyTitle: "Aviso de Seguridad",
    safetyText: "Las frecuencias altas y el volumen alto pueden dañar el oído y los altavoces. Comience siempre con un volumen bajo.",
    addInstance: "+ Añadir Generador",
    play: "Incio",
    stop: "Parar",
    volume: "Vol",
    balance: "Bal",
    waveform: "Onda",
    removeInstance: "Cerrar panel",
    rifeLabel: "Rife y Solfeggio",
    rifePlaceholder: "Buscar (ej. Dolor)...",
    downloadsTitle: "Documentos",
    downloadBtn: "Descargar",
    warning: "⚠️ Cuidado con el volumen",
    timerTitle: "Temporizador",
    timerRunning: "Restante:",
    startTimerBtn: "Inicio",
    cancelTimer: "X",
    minShort: "min",
    openSearch: "🔍 Buscar Preset",
    closeSearch: "Cerrar lista",
    // Z-App & Scalar Info
    zAppTitle: "Z-App y Terapia Escalar",
    zAppText: "Generador de frecuencias para PC, tableta o móvil. En la Z-App puede detectar cargas y transmitirlas directamente al generador escalar. Si la frecuencia no está disponible en la Z-App, puede usar este generador.",
    scalarInfo: "Para la terapia se necesita un generador escalar para permitir la transmisión. Coloque cabello o una muestra en el generador escalar para transmitir cualquier frecuencia a distancia. Más información en nuestros seminarios.",
    storeBtnAndroid: "Google Play Store",
    storeBtnIOS: "Apple App Store",
    // FAQ
    faqTitle: "¿Usos del generador?",
    faq1_title: "Afinación y Audio",
    faq1_text: "Para afinar instrumentos y pruebas de audio profesional.",
    faq2_title: "Tinnitus",
    faq2_text: "Ayuda a encontrar la frecuencia del tinnitus para terapias de enmascaramiento.",
    faq3_title: "Pulsos Binaurales",
    faq3_text: "Use dos paneles con frecuencias ligeramente diferentes para crear pulsos binaurales y estimular ondas cerebrales.",
  }
};

// ERWEITERTE RIFE LISTE (Daten aus XLSX)
const rifeList = [
  // Solfeggio & Chakras
  { freq: 174, label: "174 Hz - Schmerz & Sicherheit / Dolor" },
  { freq: 285, label: "285 Hz - Regeneration / Curación" },
  { freq: 396, label: "396 Hz - Angst lösen (UT) / Miedo" },
  { freq: 417, label: "417 Hz - Resonanz Veränderung (RE) / Cambio" },
  { freq: 528, label: "528 Hz - DNA Reparatur (MI) / DNA" },
  { freq: 639, label: "639 Hz - Harmonie (FA) / Relación" },
  { freq: 741, label: "741 Hz - Intuition (SOL) / Intuición" },
  { freq: 852, label: "852 Hz - Ordnung (LA) / Orden" },
  { freq: 963, label: "963 Hz - Zirbeldrüse / Divino" },
  { freq: 432, label: "432 Hz - Verdi A / Naturton" },
  { freq: 40, label: "40 Hz - Gamma (Fokus/Focus)" },
  
  // Rife - A-Z Selection (from your Files)
  { freq: 10000, label: "Abdominal Pain / Bauchschmerzen (Acute)" },
  { freq: 3000, label: "Abdominal Pain (Secondary)" },
  { freq: 880, label: "Abscesses / Abszesse (General)" },
  { freq: 10000, label: "Acidosis / Übersäuerung" },
  { freq: 5000, label: "Acne / Akne (General)" },
  { freq: 880, label: "Allergies / Allergien (General)" },
  { freq: 20, label: "Alopecia / Haarausfall" },
  { freq: 430, label: "Alzheimers / Alzheimer (General)" },
  { freq: 10000, label: "Amenorrhea / Ausbleiben der Regel" },
  { freq: 5000, label: "Anemia / Blutarmut" },
  { freq: 304, label: "Anxiety / Angstzustände" },
  { freq: 10000, label: "Arthritis (General)" },
  { freq: 1234, label: "Asthma (General)" },
  { freq: 787, label: "Backache / Rückenschmerzen" },
  { freq: 880, label: "Bacterial Infections / Bakterielle Infektionen" },
  { freq: 1550, label: "Bad Breath / Mundgeruch (Halitosis)" },
  { freq: 10000, label: "Blood Pressure High / Bluthochdruck" },
  { freq: 20, label: "Blood Pressure Low / Niedriger Blutdruck" },
  { freq: 380, label: "Bone Trauma / Knochentrauma" },
  { freq: 880, label: "Bronchitis" },
  { freq: 190, label: "Burns / Verbrennungen" },
  { freq: 2127, label: "Cancer / Krebs (General Rife)" },
  { freq: 465, label: "Candida (General)" },
  { freq: 2008, label: "Carpal Tunnel Syndrome" },
  { freq: 10000, label: "Chronic Fatigue / Chronische Müdigkeit" },
  { freq: 880, label: "Cold & Flu / Erkältung & Grippe" },
  { freq: 802, label: "Constipation / Verstopfung" },
  { freq: 26, label: "Cramps / Krämpfe" },
  { freq: 190, label: "Dental Infection / Zahninfektion" },
  { freq: 3.5, label: "Depression (General)" },
  { freq: 60, label: "Detox / Entgiftung (General)" },
  { freq: 2127, label: "Diabetes (General)" },
  { freq: 880, label: "Ear Conditions / Ohrenbeschwerden" },
  { freq: 787, label: "Eczema / Ekzeme" },
  { freq: 10000, label: "Eye Inflammation / Augenentzündung" },
  { freq: 428, label: "Fatigue / Müdigkeit" },
  { freq: 880, label: "Fever / Fieber" },
  { freq: 328, label: "Fibromyalgia" },
  { freq: 465, label: "Fungal Infection / Pilzinfektion" },
  { freq: 3000, label: "Gallstones / Gallensteine" },
  { freq: 880, label: "Gastritis / Magenschleimhaut" },
  { freq: 3000, label: "Gout / Gicht" },
  { freq: 160, label: "Headache / Kopfschmerzen" },
  { freq: 5000, label: "Heart General / Herz (Allgemein)" },
  { freq: 880, label: "Hemorrhoids / Hämorrhoiden" },
  { freq: 1550, label: "Hepatitis (General)" },
  { freq: 1488, label: "Herpes (General)" },
  { freq: 10000, label: "Hot Flashes / Hitzewallungen" },
  { freq: 2720, label: "Inflammation / Entzündungen" },
  { freq: 880, label: "Influenza / Grippe" },
  { freq: 10000, label: "Insomnia / Schlaflosigkeit" },
  { freq: 10000, label: "Kidney Stones / Nierensteine" },
  { freq: 33.13, label: "Liver Support / Leber Unterstützung" },
  { freq: 432, label: "Lyme / Borreliose" },
  { freq: 10000, label: "Migraine / Migräne" },
  { freq: 5000, label: "Multiple Sclerosis" },
  { freq: 3000, label: "Pain Acute / Akuter Schmerz" },
  { freq: 125, label: "Parasites / Parasiten (General)" },
  { freq: 5000, label: "Pneumonia / Lungenentzündung" },
  { freq: 2127, label: "Prostate / Prostata (General)" },
  { freq: 110, label: "Psoriasis / Schuppenflechte" },
  { freq: 250, label: "Sciatica / Ischias" },
  { freq: 787, label: "Sinusitis / Nasennebenhöhlen" },
  { freq: 880, label: "Sore Throat / Halsschmerzen" },
  { freq: 2127, label: "Stomach Disorders / Magenbeschwerden" },
  { freq: 20, label: "Tinnitus" },
  { freq: 3000, label: "Toothache / Zahnschmerzen" },
  { freq: 880, label: "Ulcers / Geschwüre" },
  { freq: 2170, label: "Warts / Warzen" },
  { freq: 727, label: "Yeast / Hefepilz (General)" }
].sort((a, b) => a.label.localeCompare(b.label)); // Alphabetisch sortieren

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
  }
];

// --- INDIVIDUAL TONE GENERATOR COMPONENT ---
function ToneInstance({ id, onRemove, t, initialFreq }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(initialFreq);
  const [volume, setVolume] = useState(0.3);
  const [pan, setPan] = useState(0);
  const [waveType, setWaveType] = useState('sine');

  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter Rife List based on search
  const filteredRife = rifeList.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.freq.toString().includes(searchTerm)
  );

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
        newCtx.close().catch(e => console.error("Error closing context:", e));
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

  // Select Frequency from Search List
  const selectPreset = (freq) => {
    setFrequency(freq);
    setSearchTerm("");
    setShowSearch(false);
  };

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

        {/* SEARCHABLE DROPDOWN */}
        <div style={{width: '100%', marginBottom: '10px'}}>
          <button 
            className="search-toggle-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? t.closeSearch : t.openSearch}
          </button>
          
          {showSearch && (
            <div className="search-wrapper">
              <input 
                type="text" 
                className="search-input"
                placeholder={t.rifePlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="search-results">
                {filteredRife.length > 0 ? (
                  filteredRife.map((r, i) => (
                    <div 
                      key={i} 
                      className="search-item"
                      onClick={() => selectPreset(r.freq)}
                    >
                      <strong>{r.freq} Hz</strong> - {r.label}
                    </div>
                  ))
                ) : (
                  <div className="search-item" style={{color: '#999'}}>Keine Ergebnisse / No results</div>
                )}
              </div>
            </div>
          )}
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
    <div className="app-container">
      {/* HEADER & NAV */}
      <div className="top-bar">
        <div className="branding">
          <h1 className="logo">Radionik ES</h1>
          <span className="version-tag">v2.2</span>
        </div>
        <div className="lang-switch">
          <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
          <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
        </div>
      </div>

      {/* INTRO TEXT & CONTROLS */}
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

      {/* TILES GRID - NOW CENTERED */}
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

      {/* BOTTOM CONTENT */}
      <div className="global-sections">

        {/* NEW Z-APP SECTION */}
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
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="download-btn-small"
                >
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
  );
}

export default App;
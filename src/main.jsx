import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Amplify Gen 2 Importe
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; // Diese Datei erstellt die Sandbox gleich

Amplify.configure(outputs);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
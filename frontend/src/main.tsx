import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

// ─── Environment Audit (Dev Only) ───
if (import.meta.env.DEV) {
  console.log('🚀 Impulse.ai: Auditing Environment Variables...');
  const essentialKeys = [
    'VITE_API_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  essentialKeys.forEach(key => {
    const val = import.meta.env[key];
    if (!val) console.warn(`⚠️  Missing environment variable: ${key}`);
    else console.log(`✅ ${key} is present.`);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="impulse-theme">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <>
    <Toaster
      position="top-center"
      richColors
      duration={2000}
      expand
      closeButton
    />
    <App />
  </>
);

import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './index.css';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <Toaster
      position="top-center"
      richColors
      duration={2000}
      expand
      closeButton
    />
    <App />
  </ErrorBoundary>
);

import { useState } from 'react';
import './styles/animations.css';
import '../styles/fonts.css';
import { IntroPage } from './components/IntroPage';
import { Header } from './components/Header';
import { RecommendationWizard } from './components/RecommendationWizard';
import { LibraryPage } from './components/LibraryPage';
import { DataProvider } from './contexts/DataContext';
import xenBg from 'figma:asset/601ea1563c500ceee090e7375229ddbc04a4dcb8.png';

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}

function AppInner() {
  const [page, setPage] = useState<'intro' | 'app' | 'library'>('intro');
  const [wizardKey, setWizardKey] = useState(0);
  const [hasProgress, setHasProgress] = useState(false);

  const goHome = () => {
    setPage('intro');
    setHasProgress(false);
    setWizardKey((k) => k + 1); // reset wizard state
  };

  const goToLibrary = () => {
    setPage('library');
  };

  const handleTitleClick = () => {
    if (page === 'intro') return;
    goHome();
  };

  const handleLibraryClick = () => {
    goToLibrary();
  };

  if (page === 'intro') {
    return <IntroPage onStart={() => setPage('app')} onLibraryClick={handleLibraryClick} />;
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: '100vh',
        backgroundColor: '#05051E',
        position: 'relative',
      }}
    >
      {/* XEN brand image - fixed behind everything, darkened */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={xenBg}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Dark overlay - keeps text legible */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5,5,30,0.80)',
          }}
        />
      </div>

      {/* App content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header
          onTitleClick={handleTitleClick}
          onLibraryClick={handleLibraryClick}
          currentPage={page}
        />
        {page === 'library' ? (
          <LibraryPage />
        ) : (
          <RecommendationWizard
            key={wizardKey}
            onProgressChange={setHasProgress}
            onBack={goHome}
          />
        )}
      </div>
    </div>
  );
}
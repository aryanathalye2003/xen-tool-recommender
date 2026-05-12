import xenLogoWhite from 'figma:asset/4785e91dafe99e13d478e1a40728b927354ff8ed.png';

interface HeaderProps {
  onTitleClick?: () => void;
  onLibraryClick?: () => void;
  currentPage?: 'intro' | 'app' | 'library';
}

export function Header({ onTitleClick, onLibraryClick, currentPage }: HeaderProps) {
  return (
    <header
      style={{
        backgroundColor: 'rgba(8,8,42,0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 28px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* XENTools Logo - clickable, goes home */}
        <img
          src={xenLogoWhite}
          alt="XENTools"
          onClick={onTitleClick}
          style={{
            height: 28,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
            cursor: onTitleClick ? 'pointer' : 'default',
            opacity: 1,
            transition: 'opacity 0.18s ease',
          }}
          onMouseEnter={(e) => {
            if (!onTitleClick) return;
            (e.currentTarget as HTMLImageElement).style.opacity = '0.75';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '1';
          }}
        />

        {/* Navigation - XENTools Finder and Library */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
        >
          <span
            onClick={onTitleClick}
            style={{
              color: currentPage === 'app' ? '#ffffff' : 'rgba(255,255,255,0.5)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLSpanElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLSpanElement).style.color =
                currentPage === 'app' ? '#ffffff' : 'rgba(255,255,255,0.5)';
            }}
          >
            XENTools Finder
            {currentPage === 'app' && (
              <div style={{
                position: 'absolute',
                bottom: -8,
                left: 0,
                right: 0,
                height: 2,
                background: '#BD4C46',
                borderRadius: 1,
              }} />
            )}
          </span>

          <span
            onClick={onLibraryClick}
            style={{
              color: currentPage === 'library' ? '#ffffff' : 'rgba(255,255,255,0.5)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLSpanElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLSpanElement).style.color =
                currentPage === 'library' ? '#ffffff' : 'rgba(255,255,255,0.5)';
            }}
          >
            Library
            {currentPage === 'library' && (
              <div style={{
                position: 'absolute',
                bottom: -8,
                left: 0,
                right: 0,
                height: 2,
                background: '#BD4C46',
                borderRadius: 1,
              }} />
            )}
          </span>
        </div>

        {/* Right spacer - mirrors logo width */}
        <div style={{ width: 100, flexShrink: 0 }} />
      </div>

      {/* Brand gradient bar - cobalt → purple → red (red is 1/4) */}
      <div
        style={{
          height: 2,
          background: 'linear-gradient(90deg, #2041CE 0%, #4A6FE8 35%, #5D3ABF 65%, #BD4C46 100%)',
          opacity: 0.75,
        }}
      />
    </header>
  );
}

import './CustomSticker.css';
import fifaLogo   from '../assets/fifa.svg';
import hockeyLogo from '../assets/hockey.png';

const flagUrl = (iso2) =>
  iso2 ? `https://flagcdn.com/w80/${iso2}.png` : null;

export default function CustomSticker({ data, scale = 1, dragHandlers = null }) {
  const {
    photoUrl, firstName, lastName,
    iso2, countryCode, customFlag,
    statsLine, club, color1, pillColor, paniniText,
    photoX = 50, photoY = 0,
    sport = 'football',
  } = data;

  const sportLogo = sport === 'hockey' ? hockeyLogo : fifaLogo;

  const flagSrc = customFlag || flagUrl(iso2);

  return (
    <div
      className="cs"
      style={{
        '--bg':   color1    || '#43c4c9',
        '--pill': data.pillColor || '#1e8689',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      {/* ── Year watermark ── */}
      <div className="cs-year-2">2</div>
      <div className="cs-year-6">6</div>

      {/* ── Photo ── */}
      <div className="cs-photo-area">
        {photoUrl ? (
          <div
            className={`cs-photo${dragHandlers ? ' cs-photo-draggable' : ''}`}
            style={{
              backgroundImage: `url(${photoUrl})`,
              backgroundPosition: `${photoX}% ${photoY}%`,
            }}
            {...(dragHandlers || {})}
          />
        ) : (
          <div className="cs-empty">
            <span className="cs-empty-icon">📷</span>
            <span className="cs-empty-txt">Subí tu foto</span>
          </div>
        )}
      </div>

      {/* ── FIFA badge — top right ── */}
      <div className="cs-fifa">
        <img src={sportLogo} alt="logo" className="cs-fifa-img" />
      </div>

      {/* ── Country — right strip ── */}
      <div className="cs-country">
        <div className="cs-flag-circle">
          {flagSrc
            ? <img src={flagSrc} alt={countryCode} className="cs-flag-img" crossOrigin="anonymous" />
            : <span style={{ fontSize: 20, opacity: 0.5 }}>🏳</span>
          }
        </div>
        {countryCode && (
          <div className="cs-country-code">
            {countryCode.split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Name pill ── */}
      <div className="cs-name-pill">
        <div className="cs-name-line">
          {firstName && <span className="cs-firstname">{firstName.toUpperCase()}</span>}
          {lastName  && <span className="cs-lastname">{lastName.toUpperCase()}</span>}
          {!firstName && !lastName && (
            <span className="cs-placeholder-name">NAME LASTNAME</span>
          )}
        </div>
        {statsLine && <div className="cs-stats">{statsLine}</div>}
      </div>

      {/* ── Club pill ── */}
      <div className="cs-club-pill">
        <span className="cs-club">{club || 'MY CLUB'}</span>
        <span className="cs-panini">{paniniText || 'PANINI'}</span>
      </div>
    </div>
  );
}

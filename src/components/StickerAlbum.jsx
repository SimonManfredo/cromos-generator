import { useState, useRef } from 'react';
import Sticker from './Sticker';
import { teams } from '../data/players';
import html2canvas from 'html2canvas';
import './StickerAlbum.css';

const generateStickerNumber = (teamIndex, playerIndex) => {
  return teamIndex * 100 + playerIndex + 1;
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function StickerAlbum() {
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openedPack, setOpenedPack] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [collection, setCollection] = useState([]);
  const [activeTab, setActiveTab] = useState('album');
  const albumRef = useRef(null);

  const allStickers = teams.flatMap((team, ti) =>
    team.players.map((player, pi) => ({
      team,
      player,
      stickerNumber: generateStickerNumber(ti, pi),
      key: `${team.id}-${player.id}`,
    }))
  );

  const filteredStickers = allStickers.filter(({ team, player }) => {
    const matchTeam = selectedTeam === 'ALL' || team.id === selectedTeam;
    const matchSearch = searchQuery === '' ||
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTeam && matchSearch;
  });

  const openPack = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      const picked = shuffle(allStickers).slice(0, 5);
      setOpenedPack(picked);
      const newKeys = picked.map(s => s.key);
      setCollection(prev => [...new Set([...prev, ...newKeys])]);
      setIsOpening(false);
    }, 600);
  };

  const closePack = () => setOpenedPack(null);

  const downloadAlbum = async () => {
    if (!albumRef.current) return;
    const canvas = await html2canvas(albumRef.current, { scale: 2, backgroundColor: '#0d1b2a' });
    const link = document.createElement('a');
    link.download = 'album-mundial-2026.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const collectedCount = collection.length;
  const totalCount = allStickers.length;
  const percent = Math.round((collectedCount / totalCount) * 100);

  return (
    <div className="album-app">
      <header className="album-header">
        <div className="header-top">
          <div className="header-title-group">
            <div className="header-badge">PANINI OFFICIAL</div>
            <h1 className="header-title">WORLD CUP 2026</h1>
            <p className="header-subtitle">Álbum de Cromos Digital</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-value">{collectedCount}</span>
              <span className="stat-label">Coleccionados</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalCount}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-value">{percent}%</span>
              <span className="stat-label">Completo</span>
            </div>
          </div>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
      </header>

      <nav className="album-nav">
        <button
          className={`nav-tab ${activeTab === 'album' ? 'active' : ''}`}
          onClick={() => setActiveTab('album')}
        >
          📖 Álbum
        </button>
        <button
          className={`nav-tab ${activeTab === 'sobre' ? 'active' : ''}`}
          onClick={() => setActiveTab('sobre')}
        >
          📦 Abrir Sobre
        </button>
        <button
          className={`nav-tab ${activeTab === 'coleccion' ? 'active' : ''}`}
          onClick={() => setActiveTab('coleccion')}
        >
          ⭐ Mi Colección
        </button>
      </nav>

      {activeTab === 'album' && (
        <div className="album-content">
          <div className="filters">
            <input
              type="text"
              placeholder="Buscar jugador o equipo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="team-filters">
              <button
                className={`filter-btn ${selectedTeam === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedTeam('ALL')}
              >
                Todos
              </button>
              {teams.map(t => (
                <button
                  key={t.id}
                  className={`filter-btn ${selectedTeam === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTeam(t.id)}
                  title={t.name}
                >
                  {t.flag}
                </button>
              ))}
            </div>
          </div>

          <div className="stickers-grid" ref={albumRef}>
            {filteredStickers.map(({ team, player, stickerNumber, key }) => (
              <div
                key={key}
                className={`sticker-slot ${collection.includes(key) ? 'collected' : 'missing'}`}
              >
                {collection.includes(key) ? (
                  <Sticker team={team} player={player} stickerNumber={stickerNumber} />
                ) : (
                  <div className="sticker-missing">
                    <span className="missing-number">#{stickerNumber}</span>
                    <span className="missing-label">?</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="album-actions">
            <button className="btn-primary" onClick={downloadAlbum}>
              ⬇ Descargar Álbum
            </button>
          </div>
        </div>
      )}

      {activeTab === 'sobre' && (
        <div className="pack-section">
          <div className="pack-container">
            <div className={`pack-card ${isOpening ? 'shaking' : ''}`} onClick={openPack}>
              <div className="pack-front">
                <div className="pack-logo">PANINI</div>
                <div className="pack-world-cup">⚽ WORLD CUP</div>
                <div className="pack-year">2026</div>
                <div className="pack-count">5 CROMOS</div>
                <div className="pack-shine" />
              </div>
            </div>
            <p className="pack-hint">¡Haz clic en el sobre para abrirlo!</p>
            <div className="pack-stats-row">
              <span>Sobres abiertos: {Math.floor(collectedCount / 5)}</span>
            </div>
          </div>

          {openedPack && (
            <div className="pack-result-overlay" onClick={closePack}>
              <div className="pack-result" onClick={e => e.stopPropagation()}>
                <h2 className="result-title">¡Nuevos Cromos!</h2>
                <div className="result-stickers">
                  {openedPack.map(({ team, player, stickerNumber }, i) => (
                    <div
                      key={i}
                      className="result-sticker-wrap"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    >
                      <Sticker team={team} player={player} stickerNumber={stickerNumber} />
                    </div>
                  ))}
                </div>
                <div className="result-actions">
                  <button className="btn-primary" onClick={openPack}>
                    Abrir otro sobre
                  </button>
                  <button className="btn-secondary" onClick={closePack}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'coleccion' && (
        <div className="album-content">
          <div className="collection-header">
            <h2>Mi Colección</h2>
            <p>{collectedCount} de {totalCount} cromos ({percent}%)</p>
          </div>
          {collectedCount === 0 ? (
            <div className="empty-collection">
              <p>Todavía no tienes cromos.</p>
              <button className="btn-primary" onClick={() => setActiveTab('sobre')}>
                ¡Abrir mi primer sobre!
              </button>
            </div>
          ) : (
            <div className="stickers-grid">
              {allStickers
                .filter(({ key }) => collection.includes(key))
                .map(({ team, player, stickerNumber, key }) => (
                  <Sticker key={key} team={team} player={player} stickerNumber={stickerNumber} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { removeBackground } from '@imgly/background-removal';
import CustomSticker from './CustomSticker';
import './StickerCreator.css';
import stoFlag    from '../assets/sto.jpeg';
import fifaLogo   from '../assets/fifa.svg';
import hockeyLogo from '../assets/hockey.png';

const FLAGS = [
  { label: 'Argentina',      iso2: 'ar',     code: 'ARG', color: '#43c4c9' },
  { label: 'Brasil',         iso2: 'br',     code: 'BRA', color: '#009B3A' },
  { label: 'España',         iso2: 'es',     code: 'ESP', color: '#AA151B' },
  { label: 'Francia',        iso2: 'fr',     code: 'FRA', color: '#0055A4' },
  { label: 'Alemania',       iso2: 'de',     code: 'GER', color: '#2B2B2B' },
  { label: 'Inglaterra',     iso2: 'gb-eng', code: 'ENG', color: '#CF111A' },
  { label: 'Portugal',       iso2: 'pt',     code: 'POR', color: '#006600' },
  { label: 'Italia',         iso2: 'it',     code: 'ITA', color: '#003399' },
  { label: 'México',         iso2: 'mx',     code: 'MEX', color: '#006847' },
  { label: 'Colombia',       iso2: 'co',     code: 'COL', color: '#FCD116' },
  { label: 'Uruguay',        iso2: 'uy',     code: 'URU', color: '#5B9BD5' },
  { label: 'Chile',          iso2: 'cl',     code: 'CHI', color: '#D52B1E' },
  { label: 'Ecuador',        iso2: 'ec',     code: 'ECU', color: '#FFD100' },
  { label: 'Venezuela',      iso2: 've',     code: 'VEN', color: '#CF142B' },
  { label: 'Perú',           iso2: 'pe',     code: 'PER', color: '#D91023' },
  { label: 'Bolivia',        iso2: 'bo',     code: 'BOL', color: '#D52B1E' },
  { label: 'Paraguay',       iso2: 'py',     code: 'PAR', color: '#D52B1E' },
  { label: 'Estados Unidos', iso2: 'us',     code: 'USA', color: '#002868' },
  { label: 'Japón',          iso2: 'jp',     code: 'JPN', color: '#BC002D' },
  { label: 'Corea del Sur',  iso2: 'kr',     code: 'KOR', color: '#CD2E3A' },
  { label: 'Marruecos',      iso2: 'ma',     code: 'MAR', color: '#C1272D' },
  { label: 'Senegal',        iso2: 'sn',     code: 'SEN', color: '#00853F' },
  { label: 'Países Bajos',   iso2: 'nl',     code: 'NED', color: '#FF6600' },
  { label: 'Croacia',        iso2: 'hr',     code: 'CRO', color: '#CC0000' },
  { label: 'Santo Domingo',  iso2: 'sto',    code: 'STO', color: '#002D62', customFlag: stoFlag },
  { label: 'Otro',           iso2: '',       code: '',    color: '#43c4c9' },
];

const flagUrl = (iso2) =>
  iso2 ? `https://flagcdn.com/w80/${iso2}.png` : null;

const DEFAULTS = {
  photoUrl:    null,
  firstName:   '',
  lastName:    '',
  iso2:        'ar',
  countryCode: 'ARG',
  statsLine:   '1-1-2000 | 1,75 m | 70 kg',
  club:        '',
  color1:      '#43c4c9',
  pillColor:   '#1e8689',
  photoX:      50,
  photoY:      0,
  customFlag:  null,
  sport:       'football',
  paniniText:  'PANINI',
};

export default function StickerCreator() {
  const [data, setData]         = useState(DEFAULTS);
  const [dragOver, setDragOver]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [removing, setRemoving]   = useState(false);
  const [saved, setSaved]       = useState([]); // eslint-disable-line no-unused-vars
  const fileRef    = useRef(null);
  const previewRef = useRef(null);
  const photoDrag  = useRef(null); // { startX, startY, startPX, startPY }

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  // ── Drag handlers para reposicionar la foto (mouse + touch) ──
  const startDrag = (clientX, clientY) => {
    photoDrag.current = {
      startX:  clientX,
      startY:  clientY,
      startPX: data.photoX ?? 50,
      startPY: data.photoY ?? 0,
    };
  };

  const moveDrag = (clientX, clientY) => {
    if (!photoDrag.current) return;
    const { startX, startY, startPX, startPY } = photoDrag.current;
    const sensitivity = 0.35;
    const newX = Math.max(0, Math.min(100, startPX - (clientX - startX) * sensitivity));
    const newY = Math.max(0, Math.min(100, startPY - (clientY - startY) * sensitivity));
    setData(prev => ({ ...prev, photoX: newX, photoY: newY }));
  };

  const endDrag = () => { photoDrag.current = null; };

  // Mouse
  const onPhotoMouseDown = (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    window.addEventListener('mousemove', onPhotoMouseMove);
    window.addEventListener('mouseup',   onPhotoMouseUp);
  };
  const onPhotoMouseMove = (e) => moveDrag(e.clientX, e.clientY);
  const onPhotoMouseUp   = () => {
    endDrag();
    window.removeEventListener('mousemove', onPhotoMouseMove);
    window.removeEventListener('mouseup',   onPhotoMouseUp);
  };

  // Touch
  const onPhotoTouchStart = (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const onPhotoTouchMove = (e) => {
    e.preventDefault();
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };
  const onPhotoTouchEnd = () => endDrag();

  const dragHandlers = data.photoUrl ? {
    onMouseDown:  onPhotoMouseDown,
    onTouchStart: onPhotoTouchStart,
    onTouchMove:  onPhotoTouchMove,
    onTouchEnd:   onPhotoTouchEnd,
  } : null;

  const loadPhoto = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    // Mostrar preview inmediato mientras procesa
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalUrl = e.target.result;
      set('photoUrl', originalUrl);
      set('photoX', 50);
      set('photoY', 0);

      // Eliminar fondo con IA
      setRemoving(true);
      try {
        const blob = await removeBackground(originalUrl, {
          model: 'isnet_quint8',
        });
        const noBgUrl = URL.createObjectURL(blob);
        set('photoUrl', noBgUrl);
      } catch (err) {
        console.warn('Background removal failed, using original:', err);
      } finally {
        setRemoving(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    loadPhoto(e.dataTransfer.files[0]);
  };

  const onCountryChange = (iso2) => {
    const found = FLAGS.find(f => f.iso2 === iso2);
    setData(prev => ({
      ...prev,
      iso2,
      countryCode:  found?.code       || '',
      customFlag:   found?.customFlag || null,
    }));
  };

  const S = 4; // escala de salida → 960 × 1352 px

  const loadImg = (src) => new Promise((res) => {
    if (!src) return res(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

  const download = async () => {
    setLoading(true);
    try {
      const W = 240 * S;
      const H = 338 * S;
      const PHOTO_H = 226 * S;

      const canvas = document.createElement('canvas');
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // ── Clip: esquinas redondeadas ──
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16 * S);
      ctx.clip();

      // ── 1. Fondo ──
      ctx.fillStyle = data.color1 || '#43c4c9';
      ctx.fillRect(0, 0, W, H);

      // ── 2. Números de fondo ──
      [
        { char: '2', x: -18, y: -10, color: '#20774d' },
        { char: '6', x: 90,  y: 55,  color: '#d93623' },
      ].forEach(({ char, x, y, color }) => {
        ctx.save();
        ctx.translate(x * S, y * S);
        ctx.scale(1.5, 0.78);
        ctx.font = `900 ${185 * S}px "Arial Black", Arial, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.lineWidth  = 25 * S;
        ctx.lineJoin   = 'round';
        ctx.strokeStyle = color;
        ctx.fillStyle   = color;
        ctx.strokeText(char, 0, 0);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      });

      // ── 3. Foto (drawImage directo → calidad máxima) ──
      if (data.photoUrl) {
        const img = await loadImg(data.photoUrl);
        if (img) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, W, PHOTO_H);
          ctx.clip();

          const px = data.photoX ?? 50;
          const py = data.photoY ?? 0;
          const ia = img.naturalWidth / img.naturalHeight;
          const aa = W / PHOTO_H;
          let sx, sy, sw, sh;
          if (ia > aa) {
            sh = img.naturalHeight; sw = sh * aa;
            sx = (img.naturalWidth - sw) * (px / 100); sy = 0;
          } else {
            sw = img.naturalWidth; sh = sw / aa;
            sx = 0; sy = (img.naturalHeight - sh) * (py / 100);
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, PHOTO_H);
          ctx.restore();
        }
      }

      // ── 4. Logo deporte (arriba derecha) ──
      const logoSrc = data.sport === 'hockey' ? hockeyLogo : fifaLogo;
      const logoImg = await loadImg(logoSrc);
      if (logoImg) {
        const lw  = 38 * S;
        const lh  = Math.round(lw * logoImg.naturalHeight / logoImg.naturalWidth);
        const pad = 5 * S;
        const bx  = W - (8 * S) - lw - pad * 2;
        const by  = 8 * S;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.roundRect(bx, by, lw + pad * 2, lh + pad * 2, 8 * S);
        ctx.fill();
        ctx.drawImage(logoImg, bx + pad, by + pad, lw, lh);
      }

      // ── 5. Bandera + código país (derecha) ──
      const flagSrc = data.customFlag ||
        (data.iso2 ? `https://flagcdn.com/w80/${data.iso2}.png` : null);
      const flagImg = await loadImg(flagSrc);
      const flagR  = 20 * S;
      const flagCX = W - (8 + 22) * S;
      const flagCY = H * 0.32;

      if (flagImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(flagCX, flagCY, flagR, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(flagImg, flagCX - flagR, flagCY - flagR, flagR * 2, flagR * 2);
        ctx.restore();
      }

      if (data.countryCode) {
        const cs = 26 * S;
        ctx.font        = `900 ${cs}px "Arial Black", Arial, sans-serif`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle  = '#fff';
        ctx.lineWidth    = 2 * S;
        ctx.lineJoin     = 'round';
        data.countryCode.split('').forEach((ch, i) => {
          ctx.strokeText(ch, flagCX, flagCY + flagR + 8 * S + i * (cs + 1));
        });
      }

      // ── 6. Píldora nombre ──
      const ps = 10 * S;
      const pw = W - ps * 2;
      const nph = 45 * S;
      const npy = (338 - 58) * S - nph;

      ctx.fillStyle = data.pillColor || '#1e8689';
      ctx.beginPath();
      ctx.roundRect(ps, npy, pw, nph, 9 * S);
      ctx.fill();

      ctx.textBaseline = 'top';
      ctx.textAlign    = 'left';
      ctx.fillStyle    = '#fff';
      const fullName = [(data.firstName || '').toUpperCase(), (data.lastName || '').toUpperCase()]
        .filter(Boolean).join(' ');
      if (fullName) {
        ctx.font = `900 ${13 * S}px "Arial Black", Arial, sans-serif`;
        ctx.fillText(fullName, ps + 12 * S, npy + 10 * S);
      }
      if (data.statsLine) {
        ctx.font      = `${8.5 * S}px Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.fillText(data.statsLine, ps + 12 * S, npy + 29 * S);
      }

      // ── 7. Píldora club ──
      const cph = 40 * S;
      const cpy = (338 - 10) * S - cph;

      ctx.fillStyle = data.pillColor || '#1e8689';
      ctx.beginPath();
      ctx.roundRect(ps, cpy, pw, cph, 9 * S);
      ctx.fill();

      ctx.font         = `700 ${11 * S}px Arial, sans-serif`;
      ctx.fillStyle    = '#fff';
      ctx.textBaseline = 'middle';
      ctx.textAlign    = 'left';
      ctx.fillText((data.club || '').toUpperCase(), ps + 12 * S, cpy + cph / 2);

      ctx.font      = `900 ${10 * S}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(data.paniniText || 'PANINI', W - ps - 12 * S, cpy + cph / 2);

      // ── Descargar ──
      const link = document.createElement('a');
      const safe = ([data.firstName, data.lastName].join('_') || 'cromo')
        .replace(/\s+/g, '_').toLowerCase();
      link.download = `cromo_${safe}_mundial2026.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="creator-page">
      <div className="creator-layout">

        {/* ══ LEFT: Form ══ */}
        <aside className="creator-form">

          {/* Photo */}
          <div className="form-section">
            <h3 className="form-section-title">📷 Foto</h3>
            <div
              className={`photo-zone ${dragOver ? 'drag-over' : ''} ${data.photoUrl ? 'has-photo' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              {data.photoUrl
                ? <img src={data.photoUrl} alt="preview" className="photo-thumb" />
                : <>
                    <span className="upload-icon">⬆</span>
                    <span className="upload-text">Arrastrá o hacé clic</span>
                    <span className="upload-sub">JPG · PNG · WEBP</span>
                  </>
              }
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => loadPhoto(e.target.files[0])}
              />
            </div>
            {data.photoUrl && (
              <button className="btn-ghost" onClick={() => set('photoUrl', null)}>
                Quitar foto
              </button>
            )}
            <p className="form-tip">
              ✨ El fondo de la foto se elimina automáticamente con IA
            </p>
          </div>

          {/* Player */}
          <div className="form-section">
            <h3 className="form-section-title">👤 Datos del jugador</h3>

            <div className="field-row">
              <div className="field-group">
                <label>Nombre</label>
                <input
                  type="text"
                  placeholder="LIONEL"
                  maxLength={14}
                  value={data.firstName}
                  onChange={e => set('firstName', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Apellido</label>
                <input
                  type="text"
                  placeholder="MESSI"
                  maxLength={14}
                  value={data.lastName}
                  onChange={e => set('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>
                Estadísticas
                <span className="label-hint"> — fecha · altura · peso</span>
              </label>
              <input
                type="text"
                placeholder="24-6-1987 | 1,70 m | 72 kg"
                maxLength={36}
                value={data.statsLine}
                onChange={e => set('statsLine', e.target.value)}
              />
            </div>
          </div>

          {/* Sport */}
          <div className="form-section">
            <h3 className="form-section-title">🏅 Deporte</h3>
            <div className="sport-selector">
              <button
                className={`sport-btn ${data.sport === 'football' ? 'active' : ''}`}
                onClick={() => set('sport', 'football')}
              >
                ⚽ Fútbol
              </button>
              <button
                className={`sport-btn ${data.sport === 'hockey' ? 'active' : ''}`}
                onClick={() => set('sport', 'hockey')}
              >
                🏑 Hockey
              </button>
            </div>
          </div>

          {/* Team */}
          <div className="form-section">
            <h3 className="form-section-title">🏟️ Equipo & País</h3>

            <div className="field-row">
              <div className="field-group">
                <label>Club</label>
                <input
                  type="text"
                  placeholder="INTER MIAMI CF"
                  maxLength={24}
                  value={data.club}
                  onChange={e => set('club', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Marca</label>
                <input
                  type="text"
                  placeholder="PANINI"
                  maxLength={12}
                  value={data.paniniText}
                  onChange={e => set('paniniText', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>País</label>
              <select value={data.iso2} onChange={e => onCountryChange(e.target.value)}>
                {FLAGS.map(f => (
                  <option key={f.label} value={f.iso2}>
                    {f.label} {f.code ? `(${f.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="color-pickers-grid">
              <div className="field-group">
                <label>Color de fondo</label>
                <div className="color-row">
                  <input
                    type="color"
                    value={data.color1}
                    onChange={e => set('color1', e.target.value)}
                    className="color-picker-full"
                  />
                  <span className="color-hex-val">{data.color1}</span>
                  <button
                    className="btn-ghost btn-tiny"
                    onClick={() => {
                      const found = FLAGS.find(f => f.iso2 === data.iso2);
                      if (found?.color) set('color1', found.color);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label>Color tarjetas</label>
                <div className="color-row">
                  <input
                    type="color"
                    value={data.pillColor}
                    onChange={e => set('pillColor', e.target.value)}
                    className="color-picker-full"
                  />
                  <span className="color-hex-val">{data.pillColor}</span>
                  <button
                    className="btn-ghost btn-tiny"
                    onClick={() => set('pillColor', '#1e8689')}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-ghost reset-btn" onClick={() => setData(DEFAULTS)}>
            Resetear todo
          </button>
        </aside>

        {/* ══ RIGHT: Preview ══ */}
        <div className="creator-preview">
          <div className="preview-label">Vista previa</div>

          <div ref={previewRef} style={{ display: 'inline-flex', position: 'relative' }}>
            <CustomSticker data={data} dragHandlers={!removing ? dragHandlers : null} />
            {removing && (
              <div className="removing-overlay">
                <span className="removing-spinner" />
                <span>Eliminando fondo...</span>
              </div>
            )}
          </div>
          {data.photoUrl && !removing && (
            <p className="photo-drag-hint">✦ Arrastrá la foto para reposicionarla</p>
          )}

          <div className="preview-actions">
            <button className="btn-download" onClick={download} disabled={loading}>
              {loading ? 'Generando...' : '⬇ Descargar PNG'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

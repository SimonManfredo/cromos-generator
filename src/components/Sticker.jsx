import { positionColors } from '../data/players';
import './Sticker.css';

const getRatingColor = (rating) => {
  if (rating >= 90) return '#FFD700';
  if (rating >= 85) return '#C0C0C0';
  if (rating >= 80) return '#CD7F32';
  return '#AAAAAA';
};

const getInitials = (name) => {
  const parts = name.replace(/^[A-Z]\.\s/, '').split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

export default function Sticker({ team, player, stickerNumber }) {
  const posColor = positionColors[player.position] || positionColors.MED;
  const ratingColor = getRatingColor(player.rating);
  const initials = getInitials(player.name);

  return (
    <div className="sticker" style={{ '--color1': team.color1, '--color2': team.color2 }}>
      <div className="sticker-header">
        <div className="sticker-competition">FIFA WORLD CUP 2026™</div>
        <div className="sticker-number">#{stickerNumber}</div>
      </div>

      <div className="sticker-photo-area">
        <div className="photo-placeholder" style={{ background: `linear-gradient(145deg, ${team.color1}, ${team.color2})` }}>
          <div className="player-initials">{initials}</div>
          <div className="shirt-number-bg">
            <span className="shirt-number">{player.number}</span>
          </div>
        </div>
        <div className="position-badge" style={{ background: posColor.bg }}>
          {posColor.label}
        </div>
        <div className="rating-badge" style={{ background: ratingColor }}>
          {player.rating}
        </div>
      </div>

      <div className="sticker-footer" style={{ background: `linear-gradient(135deg, ${team.color1} 60%, ${team.color2})` }}>
        <div className="team-flag">{team.flag}</div>
        <div className="player-info">
          <div className="player-name">{player.name}</div>
          <div className="team-name">{team.name}</div>
        </div>
        <div className="group-badge">
          <span className="group-label">GRP</span>
          <span className="group-letter">{team.group}</span>
        </div>
      </div>

      <div className="sticker-shine" />
      <div className="sticker-panini-logo">PANINI</div>
    </div>
  );
}

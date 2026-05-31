import StickerCreator from './components/StickerCreator';
import './App.css';

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">Generador de Cromos</h1>
        </div>
        <div className="app-header-line" />
      </header>
      <main>
        <StickerCreator />
      </main>
    </div>
  );
}

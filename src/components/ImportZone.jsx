import { useState, useRef, useCallback } from 'react';
import { parsePubMed } from '../utils/pubmedParser';
import { addArticles } from '../utils/storage';

export default function ImportZone({ onImport, onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState(null);
  const fileRef = useRef();

  const handleFiles = useCallback(async (files) => {
    const textFiles = [...files].filter(f => f.name.endsWith('.txt'));
    if (textFiles.length === 0) {
      setMessage({ type: 'error', text: 'Aucun fichier .txt détecté' });
      return;
    }

    let totalAdded = 0;
    let totalParsed = 0;

    for (const file of textFiles) {
      const text = await file.text();
      const articles = parsePubMed(text);
      totalParsed += articles.length;
      const result = addArticles(articles);
      totalAdded += result.added;
    }

    setMessage({
      type: 'success',
      text: `${totalParsed} article${totalParsed > 1 ? 's' : ''} détecté${totalParsed > 1 ? 's' : ''}, ${totalAdded} ajouté${totalAdded > 1 ? 's' : ''} (${totalParsed - totalAdded} doublon${totalParsed - totalAdded > 1 ? 's' : ''} ignoré${totalParsed - totalAdded > 1 ? 's' : ''})`,
    });

    if (totalAdded > 0) onImport();

    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 4000);
  }, [onImport, onClose]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-zone" onClick={e => e.stopPropagation()}>
        <button className="import-close" onClick={onClose}>×</button>
        <div
          className={`drop-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <span className="drop-icon">📂</span>
          <p className="drop-text">Glissez vos fichiers PubMed .txt ici</p>
          <p className="drop-hint">ou cliquez pour sélectionner</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".txt"
          multiple
          hidden
          onChange={e => handleFiles(e.target.files)}
        />
        {message && (
          <div className={`import-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

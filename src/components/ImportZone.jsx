import { useState, useRef, useCallback } from 'react';
import { parsePubMed } from '../utils/pubmedParser';
import { addArticles, updateArticle } from '../utils/storage';

async function enrichArticle(article) {
  try {
    const res = await fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        authors: article.authors,
        summary: article.summary,
        journal: article.journal,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function ImportZone({ articles, onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState('');
  const fileRef = useRef();

  const handleFiles = useCallback(async (files) => {
    const textFiles = [...files].filter(f => f.name.endsWith('.txt'));
    if (textFiles.length === 0) {
      setMessage({ type: 'error', text: 'Aucun fichier .txt détecté' });
      return;
    }

    setImporting(true);
    setProgress('Parsing des fichiers...');

    let allParsed = [];
    for (const file of textFiles) {
      const text = await file.text();
      allParsed.push(...parsePubMed(text));
    }

    const totalParsed = allParsed.length;
    setProgress(`${totalParsed} articles détectés. Ajout en base...`);

    const result = await addArticles(allParsed, articles);
    const totalAdded = result.added;

    if (totalAdded > 0) {
      setProgress(`Enrichissement IA : 0/${totalAdded}...`);

      const newArticles = result.addedArticles;
      for (let i = 0; i < newArticles.length; i++) {
        setProgress(`Enrichissement IA : ${i + 1}/${totalAdded}...`);
        const enriched = await enrichArticle(newArticles[i]);
        if (enriched) {
          await updateArticle(newArticles[i].id, {
            title: enriched.title_fr || newArticles[i].title,
            summary: enriched.summary_fr || newArticles[i].summary,
            takeaway: enriched.takeaway || '',
            type: enriched.type || '—',
          });
        }
      }
    }

    setImporting(false);
    setProgress('');
    setMessage({
      type: 'success',
      text: `${totalAdded} article${totalAdded > 1 ? 's' : ''} ajouté${totalAdded > 1 ? 's' : ''} et enrichi${totalAdded > 1 ? 's' : ''} (${totalParsed - totalAdded} doublon${totalParsed - totalAdded > 1 ? 's' : ''})`,
    });

    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 4000);
  }, [articles, onClose]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="import-overlay" onClick={importing ? undefined : onClose}>
      <div className="import-zone" onClick={e => e.stopPropagation()}>
        {!importing && <button className="import-close" onClick={onClose}>×</button>}
        <div
          className={`drop-area ${dragOver ? 'drag-over' : ''} ${importing ? 'importing' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={importing ? undefined : onDrop}
          onClick={() => !importing && fileRef.current?.click()}
        >
          <span className="drop-icon">{importing ? '⏳' : '📂'}</span>
          <p className="drop-text">
            {importing ? progress : 'Glissez vos fichiers PubMed .txt ici'}
          </p>
          {!importing && <p className="drop-hint">ou cliquez pour sélectionner</p>}
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

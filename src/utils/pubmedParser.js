import { classifyTheme } from './themeClassifier';

const journalMap = {
  'J Endod': 'JOE',
  'Int Endod J': 'IEJ',
  'Aust Endod J': 'AEJ',
  'Eur Endod J': 'EEJ',
};

const monthMap = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export function parsePubMed(text) {
  // Split on lines starting with "N. Journal" pattern (e.g. "1. Int Endod J")
  // This avoids false splits on wrapped lines like "Epub 2025 Aug\n11."
  const entries = text.split(/\n(?=\d+\.\s+(?:Int Endod J|J Endod|Aust Endod J|Eur Endod J))/).filter(e => e.trim());
  const articles = [];

  for (const entry of entries) {
    try {
      const article = parseEntry(entry);
      // Skip articles without title or summary
      if (article && article.title && article.summary && article.summary.length > 20) {
        articles.push(article);
      }
    } catch {
      // skip unparseable entries
    }
  }
  return articles;
}

function parseEntry(entry) {
  const lines = entry.split('\n');

  // Extract first line info (journal, year, month, vol, issue, pages)
  const firstLine = lines[0] || '';
  let journal = '';
  let year = '';
  let month = '';
  let vol = '';
  let issue = '';
  let pages = '';

  for (const [key, val] of Object.entries(journalMap)) {
    if (firstLine.includes(key)) {
      journal = val;
      break;
    }
  }

  const yearMatch = firstLine.match(/\b(20\d{2})\b/);
  if (yearMatch) year = yearMatch[1];

  const monthMatch = firstLine.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);
  if (monthMatch) month = monthMap[monthMatch[1].toLowerCase()] || '';

  const volMatch = firstLine.match(/(\d+)\((\d+)\)/);
  if (volMatch) {
    vol = volMatch[1];
    issue = volMatch[2];
  }

  const pagesMatch = firstLine.match(/:(\d+[-–]\d+)/);
  if (pagesMatch) pages = pagesMatch[1];

  // DOI & PMID
  const doiMatch = entry.match(/DOI:\s*([\d./\w-]+)/i);
  const doi = doiMatch ? doiMatch[1] : '';

  const pmidMatch = entry.match(/PMID:\s*(\d+)/i);
  const pmid = pmidMatch ? pmidMatch[1] : '';

  // Split by empty lines to find blocks
  const blocks = [];
  let currentBlock = [];
  for (const line of lines.slice(1)) {
    if (line.trim() === '') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join(' ').trim());
        currentBlock = [];
      }
    } else {
      currentBlock.push(line.trim());
    }
  }
  if (currentBlock.length > 0) blocks.push(currentBlock.join(' ').trim());

  // Title = first block
  const title = blocks[0] || '';

  // Authors = second block (before "Author information")
  let authors = '';
  if (blocks.length > 1) {
    authors = blocks[1]
      .replace(/Author information:.*$/i, '')
      .replace(/\(\d+\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Abstract = find relevant sections
  const abstractSections = ['INTRODUCTION', 'BACKGROUND', 'AIM', 'AIMS', 'METHODS', 'RESULTS', 'CONCLUSIONS', 'CONCLUSION', 'OBJECTIVE', 'OBJECTIVES', 'PURPOSE', 'MATERIALS AND METHODS'];
  let summary = '';
  const fullText = entry;

  for (const block of blocks.slice(2)) {
    const upper = block.toUpperCase();
    if (abstractSections.some(s => upper.startsWith(s + ':') || upper.startsWith(s + ' '))) {
      summary += block + ' ';
    }
  }

  if (!summary) {
    // Fallback: take all blocks after authors, excluding metadata
    summary = blocks.slice(2).filter(b =>
      !b.startsWith('Author information') &&
      !b.startsWith('Collaborators:') &&
      !b.startsWith('Comment in') &&
      !b.startsWith('Comment on') &&
      !b.startsWith('Copyright') &&
      !b.startsWith('Erratum') &&
      !b.match(/^DOI:/) &&
      !b.match(/^PMID:/) &&
      !b.match(/^PMCID:/) &&
      !b.match(/^Conflict/) &&
      !b.match(/^Grant support/) &&
      !b.match(/^\(?\d+\)\s/) &&
      b.length > 30
    ).join(' ');
  }

  summary = summary.trim();

  const monthStr = year && month ? `${year}-${month}` : `${year}-01`;
  const id = `${journal.toLowerCase()}-${vol}-${issue}-${pmid || Math.random().toString(36).slice(2, 8)}`;

  const theme = classifyTheme(title + ' ' + summary);

  return {
    id,
    month: monthStr,
    journal: journal || 'JOE',
    type: '—',
    theme,
    title,
    authors,
    summary,
    takeaway: '',
    doi,
    pages,
  };
}

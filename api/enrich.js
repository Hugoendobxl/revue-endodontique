import Anthropic from '@anthropic-ai/sdk';
import { verifyAuth } from './_auth.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (!verifyAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, authors, summary, journal } = req.body;

  if (!title || !summary) {
    return res.status(400).json({ error: 'Missing title or summary' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Tu es un endodontiste universitaire francophone spécialisé en veille scientifique. À partir de l'article suivant, génère un JSON avec exactement ces 4 champs :

1. "title_fr" : le titre traduit en français, fidèle et scientifiquement précis
2. "summary_fr" : un résumé en français de 4 à 6 lignes (environ 150-250 mots). Texte fluide avec les chiffres clés, résultats principaux et conclusion. Pas de bullet points.
3. "takeaway" : 2-3 phrases synthétiques orientées pratique clinique pour un endodontiste. Commence directement par le contenu, pas par "À retenir".
4. "type" : le type d'étude parmi cette liste : ECR, RS + Méta-analyse, Cohorte rétrospective, Cohorte prospective, Cas-contrôle, Série de cas, Case report, Revue narrative, Recherche fondamentale, In vitro, In vivo, Ex vivo, Micro-CT, Exploratoire, Nanotechnologie, Position statement. Choisis le plus approprié.

ARTICLE :
Journal: ${journal}
Title: ${title}
Authors: ${authors}
Abstract: ${summary}

Réponds UNIQUEMENT avec le JSON, sans markdown, sans backticks, sans explication.`
      }]
    });

    // Log usage to launcher
    if (message.usage) {
      fetch('https://launcher-v2-api-production.up.railway.app/api/claude-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'Revue Endodontique',
          model: 'claude-sonnet-4-20250514',
          input_tokens: message.usage.input_tokens,
          output_tokens: message.usage.output_tokens,
          endpoint: 'enrich',
        }),
      }).catch(() => {});
    }

    const text = message.content[0].text.trim();
    const result = JSON.parse(text);

    res.status(200).json(result);
  } catch (error) {
    console.error('Enrich error:', error);
    res.status(500).json({ error: 'Enrichment failed', detail: error.message });
  }
}

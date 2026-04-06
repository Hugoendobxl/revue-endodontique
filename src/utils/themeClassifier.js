const rules = [
  { pattern: /cbct|cone.beam|radiograph|diagnos|imaging|apex.locator|biomarker/i, theme: 'Diagnostic & Imagerie' },
  { pattern: /irrigat|sodium.hypochlorite|naocl|disinfect|ca\(oh\)|calcium.hydroxide|nanoparticle/i, theme: 'Irrigation & Désinfection' },
  { pattern: /niti|fatigue|instrument|file|shaping|enlarg|protat|reciproc/i, theme: 'Instrumentation' },
  { pattern: /pulpot|crack|fracture|outcome|retreatment|prognos|survival|pain|postop|flare/i, theme: 'Recherche Clinique' },
  { pattern: /resorption|innervat|inflam|cytokine|signal|pulp.biol|nerve|autophagy|connexin/i, theme: 'Biologie & Résorption' },
  { pattern: /regen|stem.cell|dpsc|scaffold|tissue.engineer|mta|biocer|calcium.silic/i, theme: 'Régénération' },
  { pattern: /anatomy|canal.morpho|root.canal.config|radix|groove|cemental/i, theme: 'Anatomie & Diagnostic' },
];

export function classifyTheme(text) {
  for (const rule of rules) {
    if (rule.pattern.test(text)) return rule.theme;
  }
  return 'Non classé';
}

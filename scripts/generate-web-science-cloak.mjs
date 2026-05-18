/**
 * Web Science Digest Generator — CloakBrowser Edition
 * 
 * Generates web-science digests from Phys.org and ScienceDaily using CloakBrowser
 * for bot-resistant browsing. Designed for headless VPS use with xvfb.
 * 
 * Usage:
 *   xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' \
 *     node scripts/generate-web-science-cloak.mjs
 * 
 * Dependencies:
 *   npm install cloakbrowser playwright-core
 * 
 * Output:
 *   web-science/YYYY-MM-DD.md  (relative to repo root)
 */

import { launch } from 'cloakbrowser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'web-science');

async function fetchPhysOrg(page) {
  console.log('Fetching Phys.org...');
  try {
    await page.goto('https://phys.org/physics-news/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning (continuing):', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const selectors = [
      'article.sorted-article',
      '.sorted-article',
      'article.news-article',
      '.news-article',
      'article'
    ];
    
    let articleElements = [];
    for (const selector of selectors) {
      articleElements = document.querySelectorAll(selector);
      if (articleElements.length > 0) break;
    }
    
    articleElements.forEach((el, idx) => {
      if (idx >= 6) return;
      
      const titleSelectors = ['h2 a', 'h3 a', '.article-title a', 'a[href*="/news/2026"]'];
      let titleEl = null;
      for (const sel of titleSelectors) {
        titleEl = el.querySelector(sel);
        if (titleEl) break;
      }
      
      const summaryEl = el.querySelector('p, .article-summary, .sorted-article-text p, .summary');
      const categoryEl = el.querySelector('.article-cat, .sub-cat, .overline, .category');
      
      if (titleEl) {
        items.push({
          title: titleEl.textContent.trim(),
          url: titleEl.href,
          summary: summaryEl ? summaryEl.textContent.trim().substring(0, 300) : '',
          category: categoryEl ? categoryEl.textContent.trim() : 'General Physics'
        });
      }
    });
    
    return items;
  });
  
  console.log(`Found ${articles.length} articles on Phys.org`);
  if (articles.length > 0) {
    articles.forEach((a, i) => console.log(`  ${i+1}. ${a.title.substring(0, 60)}...`));
  }
  return articles;
}

async function fetchScienceDaily(page) {
  console.log('Fetching ScienceDaily...');
  try {
    await page.goto('https://www.sciencedaily.com/news/matter_energy/physics/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning (continuing):', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const links = document.querySelectorAll('a[href*="/releases/2026/"]');
    
    links.forEach((linkEl, idx) => {
      if (idx >= 6) return;
      
      const title = linkEl.textContent.trim();
      const url = linkEl.href;
      
      if (title && url && title.length > 10) {
        items.push({
          title,
          url,
          summary: '',
          category: 'General Science'
        });
      }
    });
    
    return items;
  });
  
  // Fetch summaries for each article
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    try {
      console.log(`  Fetching summary for article ${i + 1}/${articles.length}: ${article.title.substring(0, 50)}...`);
      await page.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const summary = await page.evaluate(() => {
        const selectors = [
          '.lead',
          '#story_text p:first-of-type',
          '.story-text p:first-of-type',
          'article p:first-of-type',
          '.summary',
          'meta[name="description"]'
        ];
        
        for (const sel of selectors) {
          if (sel.startsWith('meta')) {
            const meta = document.querySelector(sel);
            if (meta) return meta.content;
          } else {
            const el = document.querySelector(sel);
            if (el) return el.textContent.trim().substring(0, 300);
          }
        }
        return '';
      });
      
      article.summary = summary;
    } catch (e) {
      console.log(`    Failed to fetch summary: ${e.message}`);
    }
  }
  
  console.log(`Found ${articles.length} articles on ScienceDaily`);
  if (articles.length > 0) {
    articles.forEach((a, i) => console.log(`  ${i+1}. ${a.title.substring(0, 60)}...`));
  }
  return articles;
}

function selectRelevantArticles(physOrgArticles, scienceDailyArticles) {
  const physicsKeywords = ['quantum', 'gravity', 'physics', 'particle', 'string', 'black hole', 'dark matter', 'cosmology', 'theory'];
  
  function scoreArticle(article) {
    const text = (article.title + ' ' + article.summary).toLowerCase();
    return physicsKeywords.reduce((score, kw) => score + (text.includes(kw) ? 2 : 0), 0);
  }
  
  const scoredPhysOrg = physOrgArticles.map(a => ({ ...a, score: scoreArticle(a) })).sort((a, b) => b.score - a.score);
  const scoredScienceDaily = scienceDailyArticles.map(a => ({ ...a, score: scoreArticle(a) })).sort((a, b) => b.score - a.score);
  
  return [...scoredPhysOrg.slice(0, 3), ...scoredScienceDaily.slice(0, 3)];
}

function generateDigest(articles, today) {
  let content = `# Web Science Digest — ${today}
**Sites:** Phys.org + ScienceDaily  
**Items found:** ${articles.length}  
**Focus:** ${articles.map(a => a.category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}

---
`;
  
  articles.forEach((article, idx) => {
    const articleTags = [];
    const text = (article.title + ' ' + article.summary).toLowerCase();
    if (text.includes('quantum')) articleTags.push('Quantum Information & Computing');
    if (text.includes('gravity') || text.includes('black hole') || text.includes('spacetime')) articleTags.push('Quantum Gravity', 'Black Hole Physics');
    if (text.includes('condensed') || text.includes('matter') || text.includes('solid')) articleTags.push('Many-Body Physics & Condensed Matter');
    if (text.includes('optics') || text.includes('photon') || text.includes('light')) articleTags.push('Optics & Photonics');
    if (text.includes('experiment') || text.includes('observation') || text.includes('measured')) articleTags.push('Experiment & Observation');
    if (text.includes('technology') || text.includes('engineering') || text.includes('device')) articleTags.push('Technology & Engineering');
    if (articleTags.length === 0) articleTags.push('Science Communication & Policy');
    
    content += `
## ${idx + 1}. ${article.title}
- **Source:** ${article.category}
- **URL:** ${article.url}
- **Summary:** ${article.summary || 'No summary available'}
- **Relevance:** ${generateRelevance(article)}
- **Tags:** ${articleTags.slice(0, 3).join(', ')}

---
`;
  });
  
  return content;
}

function generateRelevance(article) {
  const text = (article.title + ' ' + article.summary).toLowerCase();
  if (text.includes('quantum gravity') || text.includes('string theory') || text.includes('black hole')) {
    return '🔥 High — Direct relevance to quantum gravity and fundamental physics research';
  }
  if (text.includes('quantum')) {
    return '🔥 High — Quantum physics breakthrough with potential implications for quantum information';
  }
  if (text.includes('experiment') || text.includes('observation')) {
    return 'Medium — New experimental results that may constrain theoretical models';
  }
  return 'Medium — Interesting development in physics or related fields';
}

async function main() {
  console.log('Starting Web Science Digest generation with CloakBrowser...\n');
  
  const browser = await launch({ 
    headless: false,
    humanize: true
  });
  
  const page = await browser.newPage();
  
  const physOrgArticles = await fetchPhysOrg(page);
  const scienceDailyArticles = await fetchScienceDaily(page);
  
  await browser.close();
  
  const today = new Date().toISOString().split('T')[0];
  const selectedArticles = selectRelevantArticles(physOrgArticles, scienceDailyArticles);
  const digest = generateDigest(selectedArticles, today);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const outputFile = path.join(OUTPUT_DIR, `${today}.md`);
  fs.writeFileSync(outputFile, digest);
  console.log(`\nDigest saved to ${outputFile}`);
  
  // Update manifest
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  let manifest = [];
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  if (!manifest.includes(`${today}.md`)) {
    manifest.unshift(`${today}.md`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('Manifest updated');
  }
  
  console.log('\nDone! Run git add, commit, and push to update the repo.');
  console.log(`Selected ${selectedArticles.length} articles:`);
  selectedArticles.forEach((a, i) => console.log(`  ${i+1}. ${a.title}`));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

/**
 * Web Science Digest Generator — CloakBrowser Edition v2
 * 
 * Deduplication + diversified sources.
 * 
 * Sources: Phys.org, ScienceDaily, Nature News, Physics World, Quanta, APS Physics, arXiv
 * Deduplication: tracks seen URLs in web-science/seen-urls.json
 * 
 * Usage:
 *   xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' \
 *     node scripts/generate-web-science-cloak.mjs
 */

import { launch } from 'cloakbrowser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'web-science');
const SEEN_URLS_PATH = path.join(OUTPUT_DIR, 'seen-urls.json');

// ─── Deduplication ────────────────────────────────────────────────────────

function loadSeenUrls() {
  if (!fs.existsSync(SEEN_URLS_PATH)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(SEEN_URLS_PATH, 'utf8'));
    return new Set(Array.isArray(data) ? data : []);
  } catch {
    return new Set();
  }
}

function saveSeenUrls(seen) {
  fs.writeFileSync(SEEN_URLS_PATH, JSON.stringify([...seen].sort(), null, 2));
}

function filterNew(articles, seen) {
  return articles.filter(a => {
    const normalized = a.url.replace(/[?#].*$/, '').replace(/\/$/, '');
    return !seen.has(normalized) && !seen.has(a.url);
  });
}

// ─── Source Fetchers ──────────────────────────────────────────────────────

async function fetchPhysOrg(page) {
  console.log('Fetching Phys.org...');
  try {
    await page.goto('https://phys.org/physics-news/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning:', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const selectors = ['article.sorted-article', '.sorted-article', 'article.news-article', '.news-article', 'article'];
    let articleElements = [];
    for (const selector of selectors) {
      articleElements = document.querySelectorAll(selector);
      if (articleElements.length > 0) break;
    }
    
    articleElements.forEach((el, idx) => {
      if (idx >= 8) return;
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
          category: categoryEl ? categoryEl.textContent.trim() : 'Phys.org'
        });
      }
    });
    return items;
  });
  
  console.log(`  Found ${articles.length} articles`);
  return articles;
}

async function fetchScienceDaily(page) {
  console.log('Fetching ScienceDaily...');
  try {
    await page.goto('https://www.sciencedaily.com/news/matter_energy/physics/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning:', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const links = document.querySelectorAll('a[href*="/releases/2026/"]');
    links.forEach((linkEl, idx) => {
      if (idx >= 8) return;
      const title = linkEl.textContent.trim();
      const url = linkEl.href;
      if (title && url && title.length > 10) {
        items.push({ title, url, summary: '', category: 'ScienceDaily' });
      }
    });
    return items;
  });
  
  // Fetch summaries
  for (let i = 0; i < Math.min(articles.length, 4); i++) {
    const article = articles[i];
    try {
      console.log(`  Fetching summary ${i+1}/${Math.min(articles.length, 4)}: ${article.title.substring(0, 40)}...`);
      await page.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      const summary = await page.evaluate(() => {
        const selectors = ['.lead', '#story_text p:first-of-type', '.story-text p:first-of-type', 'article p:first-of-type', '.summary', 'meta[name="description"]'];
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
      console.log(`    Failed: ${e.message}`);
    }
  }
  
  console.log(`  Found ${articles.length} articles`);
  return articles;
}

async function fetchNatureNews(page) {
  console.log('Fetching Nature News...');
  try {
    await page.goto('https://www.nature.com/nature/articles?type=news', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning:', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const articleElements = document.querySelectorAll('article, .c-card__section, .c-article-teaser');
    articleElements.forEach((el, idx) => {
      if (idx >= 6) return;
      const titleEl = el.querySelector('h3 a, h2 a, .c-card__title a');
      const summaryEl = el.querySelector('p, .c-card__summary, .c-article-teaser__text');
      if (titleEl) {
        items.push({
          title: titleEl.textContent.trim(),
          url: titleEl.href,
          summary: summaryEl ? summaryEl.textContent.trim().substring(0, 300) : '',
          category: 'Nature News'
        });
      }
    });
    return items;
  });
  
  console.log(`  Found ${articles.length} articles`);
  return articles;
}

async function fetchPhysicsWorld(page) {
  console.log('Fetching Physics World...');
  try {
    await page.goto('https://physicsworld.com/news/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning:', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const articleElements = document.querySelectorAll('article, .news-item, .article-card');
    articleElements.forEach((el, idx) => {
      if (idx >= 6) return;
      const titleEl = el.querySelector('h2 a, h3 a, .title a, a[href*="/a/"]');
      const summaryEl = el.querySelector('p, .summary, .excerpt');
      if (titleEl) {
        items.push({
          title: titleEl.textContent.trim(),
          url: titleEl.href,
          summary: summaryEl ? summaryEl.textContent.trim().substring(0, 300) : '',
          category: 'Physics World'
        });
      }
    });
    return items;
  });
  
  console.log(`  Found ${articles.length} articles`);
  return articles;
}

async function fetchQuanta(page) {
  console.log('Fetching Quanta Magazine...');
  try {
    await page.goto('https://www.quantamagazine.org/tag/physics/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning:', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const articleElements = document.querySelectorAll('article, .post, .card');
    articleElements.forEach((el, idx) => {
      if (idx >= 6) return;
      const titleEl = el.querySelector('h2 a, h3 a, .title a, a[href*="/"]');
      const summaryEl = el.querySelector('p, .summary, .excerpt');
      if (titleEl) {
        items.push({
          title: titleEl.textContent.trim(),
          url: titleEl.href,
          summary: summaryEl ? summaryEl.textContent.trim().substring(0, 300) : '',
          category: 'Quanta Magazine'
        });
      }
    });
    return items;
  });
  
  console.log(`  Found ${articles.length} articles`);
  return articles;
}

async function fetchArXivRecent(page) {
  console.log('Fetching arXiv recent...');
  try {
    await page.goto('https://arxiv.org/list/physics/recent', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.log('Navigation warning:', e.message);
  }
  await page.waitForTimeout(5000);
  
  const articles = await page.evaluate(() => {
    const items = [];
    const articleElements = document.querySelectorAll('.meta, .list-identifier');
    const links = document.querySelectorAll('a[href*="/abs/"]');
    links.forEach((linkEl, idx) => {
      if (idx >= 5) return;
      const title = linkEl.textContent.trim();
      const url = linkEl.href;
      if (title && url && title.length > 10 && !title.includes('arXiv:')) {
        // Get abstract from nearby sibling
        const parent = linkEl.closest('dd, .meta, .arxiv-result');
        const abstractEl = parent ? parent.querySelector('.abstract, p') : null;
        items.push({
          title,
          url,
          summary: abstractEl ? abstractEl.textContent.trim().substring(0, 300) : '',
          category: 'arXiv'
        });
      }
    });
    return items;
  });
  
  console.log(`  Found ${articles.length} articles`);
  return articles;
}

// ─── Article Selection & Scoring ─────────────────────────────────────────

const physicsKeywords = ['quantum', 'gravity', 'physics', 'particle', 'string', 'black hole', 'dark matter', 'cosmology', 'theory', 'spacetime', 'entropy', 'holography', 'condensed', 'superconductor', 'topological'];

function scoreArticle(article) {
  const text = (article.title + ' ' + article.summary).toLowerCase();
  return physicsKeywords.reduce((score, kw) => score + (text.includes(kw) ? 2 : 0), 0);
}

function selectRelevantArticles(allArticles, seen, maxCount = 8) {
  // Filter out seen articles
  const newArticles = filterNew(allArticles, seen);
  console.log(`\nAfter deduplication: ${newArticles.length} new articles out of ${allArticles.length} total`);
  
  // Score and sort
  const scored = newArticles.map(a => ({ ...a, score: scoreArticle(a) })).sort((a, b) => b.score - a.score);
  
  // Diversify sources: ensure at least 2 different sources if possible
  const selected = [];
  const sourcesUsed = new Set();
  
  // First pass: pick top-scored from different sources
  for (const article of scored) {
    if (selected.length >= maxCount) break;
    if (selected.length < 4 || !sourcesUsed.has(article.category)) {
      selected.push(article);
      sourcesUsed.add(article.category);
    }
  }
  
  // Second pass: fill remaining with highest scores regardless of source
  if (selected.length < maxCount) {
    for (const article of scored) {
      if (selected.length >= maxCount) break;
      if (!selected.find(a => a.url === article.url)) {
        selected.push(article);
      }
    }
  }
  
  return selected;
}

// ─── Digest Generation ───────────────────────────────────────────────────

function generateDigest(articles, today) {
  const sources = [...new Set(articles.map(a => a.category))];
  let content = `# Web Science Digest — ${today}
**Sources:** ${sources.join(', ')}  
**Items found:** ${articles.length} new articles

---
`;
  
  articles.forEach((article, idx) => {
    const articleTags = [];
    const text = (article.title + ' ' + article.summary).toLowerCase();
    if (text.includes('quantum')) articleTags.push('Quantum Information & Computing');
    if (text.includes('gravity') || text.includes('black hole') || text.includes('spacetime')) articleTags.push('Quantum Gravity', 'Black Hole Physics');
    if (text.includes('condensed') || text.includes('matter') || text.includes('solid') || text.includes('superconductor')) articleTags.push('Many-Body Physics & Condensed Matter');
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

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('Web Science Digest Generator v2\n');
  
  const seen = loadSeenUrls();
  console.log(`Loaded ${seen.size} seen URLs\n`);
  
  const browser = await launch({ 
    headless: false,
    humanize: true
  });
  const page = await browser.newPage();
  
  // Fetch from all sources
  const allArticles = [];
  
  try {
    const physOrg = await fetchPhysOrg(page);
    allArticles.push(...physOrg);
  } catch (e) {
    console.log('Phys.org failed:', e.message);
  }
  
  try {
    const scienceDaily = await fetchScienceDaily(page);
    allArticles.push(...scienceDaily);
  } catch (e) {
    console.log('ScienceDaily failed:', e.message);
  }
  
  try {
    const nature = await fetchNatureNews(page);
    allArticles.push(...nature);
  } catch (e) {
    console.log('Nature News failed:', e.message);
  }
  
  try {
    const physicsWorld = await fetchPhysicsWorld(page);
    allArticles.push(...physicsWorld);
  } catch (e) {
    console.log('Physics World failed:', e.message);
  }
  
  try {
    const quanta = await fetchQuanta(page);
    allArticles.push(...quanta);
  } catch (e) {
    console.log('Quanta failed:', e.message);
  }
  
  try {
    const arxiv = await fetchArXivRecent(page);
    allArticles.push(...arxiv);
  } catch (e) {
    console.log('arXiv failed:', e.message);
  }
  
  await browser.close();
  
  console.log(`\nTotal articles from all sources: ${allArticles.length}`);
  
  const today = new Date().toISOString().split('T')[0];
  const selectedArticles = selectRelevantArticles(allArticles, seen, 8);
  
  if (selectedArticles.length === 0) {
    console.log('\nNo new articles found. Skipping digest generation.');
    return;
  }
  
  const digest = generateDigest(selectedArticles, today);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const outputFile = path.join(OUTPUT_DIR, `${today}.md`);
  fs.writeFileSync(outputFile, digest);
  console.log(`\nDigest saved to ${outputFile}`);
  
  // Update seen URLs
  for (const article of selectedArticles) {
    const normalized = article.url.replace(/[?#].*$/, '').replace(/\/$/, '');
    seen.add(normalized);
    seen.add(article.url);
  }
  saveSeenUrls(seen);
  console.log(`Updated seen-urls.json: ${seen.size} total URLs`);
  
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
  
  console.log(`\nSelected ${selectedArticles.length} articles:`);
  selectedArticles.forEach((a, i) => console.log(`  ${i+1}. [${a.category}] ${a.title.substring(0, 70)}...`));
  console.log('\nDone! Run git add, commit, and push to update the repo.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

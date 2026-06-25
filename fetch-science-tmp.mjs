import { launch } from 'cloakbrowser';

async function fetchScience() {
  const browser = await launch({ headless: true, humanize: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = { science: [], aiResearch: [] };
  
  try {
    console.log('Fetching m/science...');
    await page.goto('https://moltbook.com/m/science', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const scienceContent = await page.evaluate(() => {
      const posts = [];
      document.querySelectorAll('h2, h3, h4').forEach(h => {
        const a = h.querySelector('a') || h.closest('a');
        if (a && a.href) {
          posts.push({ title: h.textContent.trim().substring(0, 200), url: a.href });
        }
      });
      return posts;
    });
    results.science = scienceContent;
    
    console.log('Fetching m/ai-research...');
    await page.goto('https://moltbook.com/m/ai-research', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const aiContent = await page.evaluate(() => {
      const posts = [];
      document.querySelectorAll('h2, h3, h4').forEach(h => {
        const a = h.querySelector('a') || h.closest('a');
        if (a && a.href) {
          posts.push({ title: h.textContent.trim().substring(0, 200), url: a.href });
        }
      });
      return posts;
    });
    results.aiResearch = aiContent;
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
  
  console.log(JSON.stringify(results, null, 2));
}

fetchScience();

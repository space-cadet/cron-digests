import { launch } from 'cloakbrowser';
import fs from 'fs';

async function fetchMoltbook() {
  const browser = await launch({
    headless: true,
    humanize: true,
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = { builds: [], agents: [] };
  
  try {
    // Fetch m/builds
    console.log('Fetching m/builds...');
    await page.goto('https://moltbook.com/m/builds', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const buildsContent = await page.evaluate(() => {
      const posts = [];
      // Try to extract post titles and links
      const elements = document.querySelectorAll('a[href*="/b/"], a[href*="/post/"], article, [class*="post"], [class*="entry"]');
      elements.forEach(el => {
        const title = el.textContent?.substring(0, 200);
        const href = el.href || el.closest('a')?.href;
        if (title && href) {
          posts.push({ title: title.trim(), url: href });
        }
      });
      // Also try h2, h3, h4
      document.querySelectorAll('h2, h3, h4').forEach(h => {
        const a = h.querySelector('a') || h.closest('a');
        if (a && a.href) {
          posts.push({ title: h.textContent.trim().substring(0, 200), url: a.href });
        }
      });
      return posts;
    });
    results.builds = buildsContent;
    
    // Fetch m/agents
    console.log('Fetching m/agents...');
    await page.goto('https://moltbook.com/m/agents', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const agentsContent = await page.evaluate(() => {
      const posts = [];
      const elements = document.querySelectorAll('a[href*="/b/"], a[href*="/post/"], article, [class*="post"], [class*="entry"]');
      elements.forEach(el => {
        const title = el.textContent?.substring(0, 200);
        const href = el.href || el.closest('a')?.href;
        if (title && href) {
          posts.push({ title: title.trim(), url: href });
        }
      });
      document.querySelectorAll('h2, h3, h4').forEach(h => {
        const a = h.querySelector('a') || h.closest('a');
        if (a && a.href) {
          posts.push({ title: h.textContent.trim().substring(0, 200), url: a.href });
        }
      });
      return posts;
    });
    results.agents = agentsContent;
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
  
  console.log(JSON.stringify(results, null, 2));
}

fetchMoltbook();

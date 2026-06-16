import { launch } from 'cloakbrowser';
import fs from 'fs';

const posts = [
  { url: 'https://moltbook.com/post/d4eb56a3-f68a-402c-9170-aafdad6a5fba', title: 'Circular dependency on a tree' },
  { url: 'https://moltbook.com/post/1b2a99ed-5e26-4ee4-bb6f-c8a6bad57da4', title: 'Claude builds Claude' },
  { url: 'https://moltbook.com/post/34ee070f-6030-4050-9e68-bacce8dd4856', title: 'Witness loses isolation' },
  { url: 'https://moltbook.com/post/085316d5-c845-4781-8c94-8d2d2c672214', title: 'Agent loops need ledger' },
  { url: 'https://moltbook.com/post/d47b9e91-d7d4-48d3-87ec-6f1a5159f711', title: 'Self-model wrong, cron caught it' },
  { url: 'https://moltbook.com/post/65374113-cf8e-4803-af0d-2e3a17b0f4f7', title: 'Task finished, intent did not' },
  { url: 'https://moltbook.com/post/5e6db51e-cad5-43fc-97b5-25e7331fce2f', title: 'Write access to config' },
  { url: 'https://moltbook.com/post/e478db2a-5c67-4383-8168-d4bcbefc928a', title: 'Trust anonymous agent with money' },
];

async function fetchPosts() {
  const browser = await launch({ headless: true, humanize: true });
  const context = await browser.newContext();
  const results = [];

  for (const post of posts) {
    try {
      const page = await context.newPage();
      await page.goto(post.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      const content = await page.evaluate(() => {
        const title = document.querySelector('h1, [class*="title"], [class*="post-title"]')?.textContent?.trim() || '';
        const body = document.querySelector('article, [class*="content"], [class*="post-body"], main')?.textContent?.trim() || '';
        const author = document.querySelector('[class*="author"], [class*="byline"]')?.textContent?.trim() || '';
        const score = document.querySelector('[class*="score"], [class*="vote"]')?.textContent?.trim() || '';
        return { title, body: body.substring(0, 5000), author, score };
      });

      results.push({ url: post.url, ...content });
      await page.close();
    } catch (e) {
      results.push({ url: post.url, error: e.message });
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

fetchPosts();

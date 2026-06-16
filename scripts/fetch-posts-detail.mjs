import { launch } from 'cloakbrowser';
import fs from 'fs';

const urls = [
  'https://moltbook.com/post/0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
  'https://moltbook.com/post/9c8d7e6f-5a4b-3c2d-1e0f-9a8b7c6d5e4f',
  'https://moltbook.com/post/8d7e6f5a-4b3c-2d1e-0f9a-8b7c6d5e4f3a',
  'https://moltbook.com/post/7e6f5a4b-3c2d-1e0f-9a8b-7c6d5e4f3a2b',
  'https://moltbook.com/post/6f5a4b3c-2d1e-0f9a-8b7c-6d5e4f3a2b1c',
  'https://moltbook.com/post/5a4b3c2d-1e0f-9a8b-7c6d-5e4f3a2b1c0d',
  'https://moltbook.com/post/4b3c2d1e-0f9a-8b7c-6d5e-4f3a2b1c0d9e',
  'https://moltbook.com/post/3c2d1e0f-9a8b-7c6d-5e4f-3a2b1c0d9e8f',
  'https://moltbook.com/post/d2211b88-d59f-4b22-9ce8-3c69600fe92f',
  'https://moltbook.com/post/993a3a34-5598-4f0b-9396-5fa5fb6ae86b',
];

async function fetchPosts() {
  const browser = await launch({ headless: true, humanize: true });
  const context = await browser.newContext();
  const results = [];

  for (const url of urls) {
    try {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      const content = await page.evaluate(() => {
        const title = document.querySelector('h1, [class*="title"], [class*="post-title"]')?.textContent?.trim() || '';
        const body = document.querySelector('article, [class*="content"], [class*="post-body"], main')?.textContent?.trim() || '';
        const author = document.querySelector('[class*="author"], [class*="byline"]')?.textContent?.trim() || '';
        return { title, body: body.substring(0, 3000), author };
      });

      results.push({ url, ...content });
      await page.close();
    } catch (e) {
      results.push({ url, error: e.message });
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

fetchPosts();

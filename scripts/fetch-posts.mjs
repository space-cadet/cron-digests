import { launch } from 'cloakbrowser';

const posts = [
  { url: 'https://moltbook.com/post/814d0739-0487-4e47-950e-72742781ef04', title: 'Brief #172: The Self-Specialization Trap' },
  { url: 'https://moltbook.com/post/23f58017-22e5-430e-9f60-acaadddf68f5', title: 'The Verification-Tax' },
  { url: 'https://moltbook.com/post/7fce91d9-c1fb-4def-9d7c-a77a562c67b9', title: 'Agent reliability cliff' },
  { url: 'https://moltbook.com/post/a930e522-0677-45d2-86fa-e90dbda7acb7', title: 'Synthesis-Verification Protocol' },
  { url: 'https://moltbook.com/post/d0890b09-b5ac-4763-979f-795e9093c61b', title: 'Context-Averaging Trap' },
  { url: 'https://moltbook.com/post/38af711d-00e6-49a8-b7eb-6276218ffa5e', title: 'Agents ignore contradictory tool output' },
  { url: 'https://moltbook.com/post/ff1020bb-c89e-45e7-89f1-1d00c7481b26', title: 'How do you verify your MEMORY.md changes' },
  { url: 'https://moltbook.com/post/af56bd99-330a-4817-a08e-0ae7d2e6cb9f', title: 'The bottleneck in multi-agent systems' },
  { url: 'https://moltbook.com/post/607f2c6e-10a8-4005-8804-4ad9c4e24981', title: 'Verifiable reputation without shared state' },
];

async function fetchPost(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    const text = await page.evaluate(() => {
      const article = document.querySelector('article, [class*="post"], [class*="content"]');
      if (article) return article.innerText.substring(0, 3000);
      return document.body.innerText.substring(0, 3000);
    });
    return text;
  } catch (e) {
    return `ERROR: ${e.message}`;
  }
}

async function main() {
  const browser = await launch({ headless: true, humanize: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {};
  for (const p of posts) {
    console.log(`Fetching ${p.title}...`);
    const text = await fetchPost(page, p.url);
    results[p.title] = { url: p.url, text };
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });

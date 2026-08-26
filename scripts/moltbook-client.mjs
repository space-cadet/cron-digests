#!/usr/bin/env node
/**
 * Shared Moltbook API client.
 * Both Moltbook cron jobs use this module for credentials, requests, feed
 * selection, response validation, normalization, and deduplication.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_BASE = 'https://www.moltbook.com/api/v1';
const ENV_FILE = path.join(os.homedir(), '.openclaw', 'moltbook-env.sh');

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const values = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const match = line.match(/^\s*export\s+(MOLTBOOK_API_KEY|MOLTBOOK_BASE)=(?:"([^"]*)"|'([^']*)'|([^\s#]+))/);
    if (match) values[match[1]] = match[2] ?? match[3] ?? match[4];
  }
  return values;
}

const fileEnv = loadEnvFile();
const API_KEY = process.env.MOLTBOOK_API_KEY || fileEnv.MOLTBOOK_API_KEY;
const BASE_URL = (process.env.MOLTBOOK_BASE || fileEnv.MOLTBOOK_BASE || DEFAULT_BASE).replace(/\/$/, '');

function assertConfiguration() {
  if (!API_KEY) throw new Error('MOLTBOOK_API_KEY is not configured');
  const base = new URL(BASE_URL);
  if (base.protocol !== 'https:' || base.hostname !== 'www.moltbook.com' || !base.pathname.startsWith('/api/v1')) {
    throw new Error('Refusing Moltbook request: base URL must be https://www.moltbook.com/api/v1');
  }
}

export async function requestJson(endpoint, options = {}) {
  assertConfiguration();
  const url = new URL(endpoint.replace(/^\/+/, ''), `${BASE_URL}/`);
  if (url.origin !== 'https://www.moltbook.com') {
    throw new Error(`Refusing request to unexpected origin: ${url.origin}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 20000);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Moltbook returned non-JSON (${response.status})`);
    }
    if (!response.ok) {
      const detail = body?.error || body?.message || response.statusText;
      throw new Error(`Moltbook ${response.status}: ${detail}`);
    }
    if (body?.success === false) {
      throw new Error(`Moltbook request failed: ${body.error || body.message || 'unknown error'}`);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

function canonicalPostUrl(id) {
  return `https://www.moltbook.com/post/${encodeURIComponent(id)}`;
}

export function normalizePost(post, expectedSubmolt = null) {
  if (!post || typeof post !== 'object') return null;
  const submolt = post.submolt_name || post.submolt?.name || '';
  if (!post.id || !post.title || !post.created_at || !submolt) return null;
  if (expectedSubmolt && submolt !== expectedSubmolt) return null;

  return {
    id: String(post.id),
    url: canonicalPostUrl(post.id),
    submolt,
    author: post.author?.name || post.author || 'unknown',
    created_at: post.created_at,
    title: String(post.title).trim(),
    content: String(post.content || '').trim(),
    upvotes: Number(post.upvotes || 0),
    comment_count: Number(post.comment_count || 0),
    labels: Array.isArray(post.labels) ? post.labels : []
  };
}

export async function getSubmoltFeed(submolt, { sort = 'new', limit = 25, cursor } = {}) {
  const params = new URLSearchParams({ sort, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  // The documented convenience endpoint is required. The older
  // /feed?submolt=... form can silently return the general feed.
  const body = await requestJson(`/submolts/${encodeURIComponent(submolt)}/feed?${params}`);
  if (!Array.isArray(body.posts)) throw new Error(`Moltbook ${submolt} feed has no posts array`);
  const posts = body.posts.map(post => normalizePost(post, submolt)).filter(Boolean);
  if (posts.length !== body.posts.length) {
    throw new Error(`Moltbook ${submolt} feed contained posts from another or invalid source`);
  }
  return { submolt, total: body.total ?? null, posts, raw: body.posts };
}

const RESEARCH_TOPICS = [
  ['quantum', /quantum|qubit|qpu/i],
  ['physics', /physics|gravity|spacetime|black hole|cosmolog/i],
  ['information-theory', /information theory|entropy|compression|coding theory/i],
  ['agent-architecture', /agent|orchestration|workflow|tool call|multi-agent|autonom/i],
  ['reasoning', /reasoning|verification|reliab|memory|context|eval/i],
  ['language-models', /llm|language model|gpt|transformer|inference/i],
  ['chinese-learning', /chinese|mandarin|language learning/i]
];

export function researchTopics(post) {
  const text = `${post.title}\n${post.content}`;
  return RESEARCH_TOPICS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

export async function getResearchPosts({ limit = 25, sinceHours = 36 } = {}) {
  const submolts = ['builds', 'agents'];
  const feeds = await Promise.all(submolts.map(submolt => getSubmoltFeed(submolt, { sort: 'new', limit })));
  const cutoff = Date.now() - sinceHours * 60 * 60 * 1000;
  const seen = new Set();
  const posts = [];

  for (const feed of feeds) {
    for (const post of feed.posts) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      const created = Date.parse(post.created_at);
      if (!Number.isFinite(created) || created < cutoff) continue;
      const topics = researchTopics(post);
      if (topics.length === 0) continue;
      posts.push({ ...post, topics });
    }
  }

  posts.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return { feeds, posts };
}

export async function getPersonalSnapshot({ limit = 10 } = {}) {
  const [home, notifications, memory] = await Promise.all([
    requestJson('/home'),
    requestJson(`/notifications?limit=${encodeURIComponent(limit)}`),
    getSubmoltFeed('memory', { sort: 'new', limit })
  ]);
  return { home, notifications, memory };
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 25;

  if (command === 'personal') {
    console.log(JSON.stringify(await getPersonalSnapshot({ limit }), null, 2));
    return;
  }
  if (command === 'research') {
    const sinceArg = args.find(arg => arg.startsWith('--since-hours='));
    const sinceHours = sinceArg ? Number(sinceArg.slice('--since-hours='.length)) : 36;
    console.log(JSON.stringify(await getResearchPosts({ limit, sinceHours }), null, 2));
    return;
  }
  if (command === 'feed') {
    const names = args.filter(arg => !arg.startsWith('--'));
    const feeds = await Promise.all(names.map(name => getSubmoltFeed(name, { limit })));
    console.log(JSON.stringify({ feeds }, null, 2));
    return;
  }
  throw new Error('Usage: moltbook-client.mjs personal|research|feed <submolt...> [--limit=N]');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`Moltbook client error: ${error.message}`);
    process.exitCode = 1;
  });
}

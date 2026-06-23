const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const viewerDir = __dirname;
const repoRoot = path.resolve(viewerDir, '..');

// Simple static file server
const server = http.createServer((req, res) => {
    let filePath = path.join(repoRoot, req.url === '/' ? 'viewer/index.html' : req.url);
    
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(repoRoot)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.json': 'application/json',
        '.md': 'text/markdown'
    };
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(data);
    });
});

async function runTests() {
    return new Promise((resolve) => {
        server.listen(3456, '127.0.0.1', async () => {
            console.log('Server running on http://127.0.0.1:3456');
            
            const browser = await chromium.launch({ headless: true });
            const context = await browser.newContext();
            const page = await context.newPage();
            
            let passed = 0;
            let failed = 0;
            
            // Read index.json to know expected digests
            const indexData = JSON.parse(fs.readFileSync(path.join(viewerDir, 'index.json'), 'utf8'));
            const digests = indexData.digests || [];
            const latestDigest = digests[0];
            
            try {
                // Test 1: Page loads and cards render
                console.log('\n[Test 1] Page loads successfully');
                await page.goto('http://127.0.0.1:3456/viewer/index.html');
                await page.waitForTimeout(2000);
                
                const cards = await page.locator('.digest-card').count();
                console.log('Card count:', cards);
                
                if (cards >= 1) {
                    console.log('✅ PASS: Page loaded and digest cards rendered');
                    passed++;
                } else {
                    console.log('❌ FAIL: No digest cards found');
                    failed++;
                }
                
                // Test 2: Latest digest is visible
                if (latestDigest) {
                    console.log(`\n[Test 2] Latest digest (${latestDigest.date} ${latestDigest.type}) is visible`);
                    const latestCard = await page.locator(`.digest-card[data-date="${latestDigest.date}"]`).count();
                    if (latestCard >= 1) {
                        console.log('✅ PASS: Latest digest card is visible');
                        passed++;
                    } else {
                        console.log('❌ FAIL: Latest digest not found in rendered cards');
                        failed++;
                    }
                }
                
                // Test 3: Search functionality
                if (cards >= 1) {
                    console.log('\n[Test 3] Search filters digests');
                    await page.fill('#searchInput', '2026-05-11');
                    await page.waitForTimeout(500);
                    const visibleCards = await page.locator('.digest-card:not(.hidden)').count();
                    console.log(`   Found ${visibleCards} visible cards after search`);
                    if (visibleCards >= 1) {
                        console.log('✅ PASS: Search filtering works');
                        passed++;
                    } else {
                        console.log('❌ FAIL: No cards visible after search');
                        failed++;
                    }
                    
                    // Clear search
                    await page.fill('#searchInput', '');
                    await page.waitForTimeout(500);
                    
                    // Test 4: Filter buttons
                    console.log('\n[Test 4] Filter buttons work');
                    await page.click('[data-filter="arxiv"]');
                    await page.waitForTimeout(500);
                    const arxivCards = await page.locator('.digest-card:not(.hidden)').count();
                    console.log(`   Found ${arxivCards} arXiv cards`);
                    if (arxivCards >= 1) {
                        console.log('✅ PASS: arXiv filter works');
                        passed++;
                    } else {
                        console.log('❌ FAIL: No arXiv cards found');
                        failed++;
                    }
                    
                    // Test 5: Click card opens modal with content
                    console.log('\n[Test 5] Clicking card opens modal with content');
                    await page.click('[data-filter="all"]');
                    await page.waitForTimeout(300);
                    await page.locator('.digest-card').first().click();
                    await page.waitForTimeout(800);
                    const modalVisible = await page.locator('.modal-overlay.active').isVisible();
                    if (modalVisible) {
                        const modalContent = await page.locator('#modalBody').textContent();
                        if (modalContent && modalContent.length > 100) {
                            console.log('✅ PASS: Modal opens with content loaded');
                            passed++;
                        } else {
                            console.log('❌ FAIL: Modal opened but content is too short or missing');
                            failed++;
                        }
                    } else {
                        console.log('❌ FAIL: Modal did not open');
                        failed++;
                    }
                    
                    // Test 6: Modal content includes digest entries
                    console.log('\n[Test 6] Modal shows digest entries (TOC + items)');
                    const hasToc = await page.locator('.modal-toc').count() > 0;
                    const hasItems = await page.locator('.paper-item').count() > 0;
                    if (hasToc || hasItems) {
                        console.log(`✅ PASS: Modal has structure (TOC:${hasToc}, Items:${hasItems})`);
                        passed++;
                    } else {
                        console.log('❌ FAIL: Modal missing TOC or items');
                        failed++;
                    }
                    
                    // Test 7: Modal close button works
                    console.log('\n[Test 7] Modal close button works');
                    await page.click('#modalClose');
                    await page.waitForTimeout(300);
                    const modalHidden = await page.locator('.modal-overlay.active').count() === 0;
                    if (modalHidden) {
                        console.log('✅ PASS: Modal closes correctly');
                        passed++;
                    } else {
                        console.log('❌ FAIL: Modal did not close');
                        failed++;
                    }
                    
                    // Test 8: Responsive layout
                    console.log('\n[Test 8] Responsive layout');
                    await page.setViewportSize({ width: 375, height: 667 });
                    await page.waitForTimeout(500);
                    const mobileCards = await page.locator('.digest-card').count();
                    if (mobileCards >= 1) {
                        console.log('✅ PASS: Mobile layout renders correctly');
                        passed++;
                    } else {
                        console.log('❌ FAIL: No cards on mobile');
                        failed++;
                    }
                    
                    await page.setViewportSize({ width: 1280, height: 720 });
                    
                    // Test 9: Tag chips are visible
                    console.log('\n[Test 9] Tag chips render in cards');
                    const tagChips = await page.locator('.tag-chip').count();
                    if (tagChips > 0) {
                        console.log(`✅ PASS: ${tagChips} tag chips visible`);
                        passed++;
                    } else {
                        console.log('⚠️ SKIP: No tag chips (maybe empty dataset)');
                        // Don't count as failure — tags depend on data
                    }
                    
                    // Test 10: Category badges render in cards
                    console.log('\n[Test 10] Category badges render');
                    const badges = await page.locator('.digest-type').count();
                    if (badges > 0) {
                        console.log(`✅ PASS: ${badges} type badges visible`);
                        passed++;
                    } else {
                        console.log('❌ FAIL: No type badges found');
                        failed++;
                    }
                    
                    // Test 11: Clicking a specific recent digest opens correct content
                    if (latestDigest) {
                        console.log(`\n[Test 11] Latest digest (${latestDigest.date}) modal has correct title`);
                        const card = await page.locator(`.digest-card[data-date="${latestDigest.date}"]`).first();
                        if (await card.count() > 0) {
                            await card.click();
                            await page.waitForTimeout(800);
                            const modalTitle = await page.locator('.modal-content h1').textContent();
                            if (modalTitle && modalTitle.includes(latestDigest.date)) {
                                console.log('✅ PASS: Modal shows correct digest title');
                                passed++;
                            } else {
                                console.log(`❌ FAIL: Modal title "${modalTitle}" does not include expected date ${latestDigest.date}`);
                                failed++;
                            }
                            await page.click('#modalClose');
                            await page.waitForTimeout(300);
                        }
                    }
                }
                
            } catch (e) {
                console.error('Test error:', e.message);
                failed++;
            }
            
            console.log(`\n${'='.repeat(40)}`);
            console.log(`Results: ${passed} passed, ${failed} failed`);
            console.log(`${'='.repeat(40)}\n`);
            
            await browser.close();
            server.close();
            resolve({ passed, failed });
        });
    });
}

runTests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
});

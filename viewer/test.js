const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server
const server = http.createServer((req, res) => {
    const viewerDir = __dirname;
    const repoRoot = path.resolve(viewerDir, '..');
    let filePath = path.join(repoRoot, req.url === '/' ? 'viewer/index.html' : req.url);
    
    // Security: prevent directory traversal
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
            
            try {
                // Test 1: Page loads
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
                
                // Test 2: Search functionality
                if (cards >= 1) {
                    console.log('\n[Test 2] Search filters digests');
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
                    
                    // Test 3: Filter buttons
                    console.log('\n[Test 3] Filter buttons work');
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
                    
                    // Test 4: Click card opens modal
                    console.log('\n[Test 4] Clicking card opens modal');
                    await page.click('[data-filter="all"]');
                    await page.waitForTimeout(300);
                    await page.locator('.digest-card').first().click();
                    await page.waitForTimeout(500);
                    const modalVisible = await page.locator('.modal-overlay.active').isVisible();
                    if (modalVisible) {
                        console.log('✅ PASS: Modal opens on card click');
                        passed++;
                    } else {
                        console.log('❌ FAIL: Modal did not open');
                        failed++;
                    }
                    
                    // Test 5: Modal close button works
                    console.log('\n[Test 5] Modal close button works');
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
                    
                    // Test 6: Responsive layout
                    console.log('\n[Test 6] Responsive layout');
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
                    
                    // Test 7: Content rendering
                    console.log('\n[Test 7] Digest content renders');
                    await page.setViewportSize({ width: 1280, height: 720 });
                    await page.locator('.digest-card').first().click();
                    await page.waitForTimeout(500);
                    const modalContent = await page.locator('#modalBody').textContent();
                    if (modalContent && modalContent.length > 50) {
                        console.log('✅ PASS: Digest content loaded in modal');
                        passed++;
                    } else {
                        console.log('❌ FAIL: Content not loaded');
                        failed++;
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

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert');

test('ai_edge_gallery_get_result', async (t) => {
  // Read HTML and extract script content
  const htmlPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, 'Could not find script tag in index.html');
  const scriptContent = scriptMatch[1];

  // Evaluate script in a mock environment
  const window = {};
  eval(scriptContent);
  const fn = window['ai_edge_gallery_get_result'];
  assert.strictEqual(typeof fn, 'function', 'ai_edge_gallery_get_result should be defined as a function');

  await t.test('Happy path: successfully process valid data', async () => {
    const data = JSON.stringify({ genre: 'Trap' });
    const resultJson = await fn(data);
    const result = JSON.parse(resultJson);

    assert.strictEqual(result.result, 'Beat loaded! Press play to listen.');
    assert.ok(result.webview.url.includes(encodeURIComponent(data)));
  });

  await t.test('Error path: safely catch and handle string encoding errors', async () => {
    // A standalone high surrogate character throws a URIError when passed to encodeURIComponent
    const invalidData = '\uD800';
    const resultJson = await fn(invalidData);
    const result = JSON.parse(resultJson);

    assert.strictEqual(result.error, 'Bridge failed.');
  });

  await t.test('Happy path: strips markdown backticks', async () => {
      const data = '```json\n{"genre": "Trap"}\n```';
      const resultJson = await fn(data);
      const result = JSON.parse(resultJson);

      assert.strictEqual(result.result, 'Beat loaded! Press play to listen.');
      assert.ok(result.webview.url.includes(encodeURIComponent('{"genre": "Trap"}')));
  });
});

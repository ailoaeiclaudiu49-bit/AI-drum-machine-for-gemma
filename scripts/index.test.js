const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('ai_edge_gallery_get_result', () => {
  let dom;
  let window;

  beforeEach(() => {
    // Load the HTML file
    const htmlPath = path.resolve(__dirname, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Create a JSDOM instance and execute scripts
    dom = new JSDOM(html, { runScripts: "dangerously" });
    window = dom.window;
  });

  test('should attach ai_edge_gallery_get_result to the window object', () => {
    expect(typeof window.ai_edge_gallery_get_result).toBe('function');
  });

  test('should fallback to empty JSON string when data is null', async () => {
    const result = await window.ai_edge_gallery_get_result(null);
    const parsed = JSON.parse(result);

    expect(parsed.result).toBe("Beat loaded! Press play to listen.");
    expect(parsed.webview.url).toBe("../assets/widget.html?data=%7B%7D"); // encoded "{}"
  });

  test('should fallback to empty JSON string when data is undefined', async () => {
    const result = await window.ai_edge_gallery_get_result();
    const parsed = JSON.parse(result);

    expect(parsed.result).toBe("Beat loaded! Press play to listen.");
    expect(parsed.webview.url).toBe("../assets/widget.html?data=%7B%7D"); // encoded "{}"
  });

  test('should process a valid JSON string correctly', async () => {
    const data = '{"key": "value"}';
    const result = await window.ai_edge_gallery_get_result(data);
    const parsed = JSON.parse(result);

    expect(parsed.result).toBe("Beat loaded! Press play to listen.");
    expect(parsed.webview.url).toBe(`../assets/widget.html?data=${encodeURIComponent(data)}`);
  });

  test('should process markdown wrapped JSON correctly', async () => {
    const data = '```json\n{"key": "value"}\n```';
    const expectedCleanData = '{"key": "value"}';
    const result = await window.ai_edge_gallery_get_result(data);
    const parsed = JSON.parse(result);

    expect(parsed.result).toBe("Beat loaded! Press play to listen.");
    expect(parsed.webview.url).toBe(`../assets/widget.html?data=${encodeURIComponent(expectedCleanData)}`);
  });

  test('should trim markdown wrapped JSON correctly with extra spaces', async () => {
    const data = '```json   \n  {"key": "value"}  \n   ```';
    const expectedCleanData = '{"key": "value"}';
    const result = await window.ai_edge_gallery_get_result(data);
    const parsed = JSON.parse(result);

    expect(parsed.result).toBe("Beat loaded! Press play to listen.");
    expect(parsed.webview.url).toBe(`../assets/widget.html?data=${encodeURIComponent(expectedCleanData)}`);
  });

  test('should handle encodeURIComponent failure and return error JSON', async () => {
    // Override encodeURIComponent to throw an error
    const originalEncodeURIComponent = window.encodeURIComponent;
    window.encodeURIComponent = () => { throw new Error("Mocked encoding failure"); };

    const result = await window.ai_edge_gallery_get_result('{"test": "data"}');
    const parsed = JSON.parse(result);

    expect(parsed.error).toBe("Bridge failed.");

    // Restore the original
    window.encodeURIComponent = originalEncodeURIComponent;
  });
});

import os
from playwright.sync_api import sync_playwright

def run_benchmark(html_path):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_url = f"file://{os.path.abspath(html_path)}"
        page.goto(file_url)

        # Inject the benchmark script
        benchmark_script = """
        () => {
            // Stub out audio functions to only measure DOM performance
            window.playKick = () => {};
            window.playTom = () => {};
            window.playSnare = () => {};
            window.playClap = () => {};
            window.playClosedHat = () => {};
            window.playOpenHat = () => {};

            // Audio context is missing, mock it correctly in the global scope
            if (!window.audioCtx) {
              window.audioCtx = { currentTime: 0 };
            }

            // Since `audioCtx` is let-defined, it might not be a property of `window` directly.
            // Oh, we can just call `initAudio()` which will initialize a valid audio context if supported.
            // Let's actually override the audioCtx variable or just use `initAudio()`
            try {
              initAudio();
            } catch(e) {}

            // Wait, initAudio initializes actual AudioContext. We just need to intercept nextNote?
            // Actually, `audioCtx` is declared with let in the script scope so it's not on `window`.
            // But we can call initAudio() and suspend it.
            // Let's just create an AudioContext if not present

            // Let's modify the page script instead?
            // Better: Playwright evaluates in the page context. If we evaluate this, we can access global vars if they are var or let. Let's see.
            // Actually, evaluate is run as a function. The script scope `let` variables are not accessible.
            // So we need to mock it from inside.

            // Let's mock window.AudioContext and then call initAudio()
            window.AudioContext = class {
              constructor() { this.state = 'running'; this.currentTime = 0; }
              resume() {}
            };
            window.webkitAudioContext = window.AudioContext;
            initAudio(); // this sets the script's `audioCtx` to our mock!

            // Set some patterns to ensure functions are called
            pattern.kick.fill(1);
            pattern.tom.fill(1);

            const iterations = 5000;
            const start = performance.now();

            for (let i = 0; i < iterations; i++) {
                nextNote();
            }

            const end = performance.now();
            return {
                iterations: iterations,
                time_ms: end - start,
                avg_ms: (end - start) / iterations
            };
        }
        """

        result = page.evaluate(benchmark_script)
        print(f"Benchmark Results for {html_path}:")
        print(f"Iterations: {result['iterations']}")
        print(f"Total Time: {result['time_ms']:.2f} ms")
        print(f"Average Time per nextNote: {result['avg_ms']:.4f} ms")

        browser.close()

if __name__ == "__main__":
    run_benchmark("assets/widget.html")

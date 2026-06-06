/* WebOS System Apps - Terminal, Walkthrough, About */

/* ===== TERMINAL ===== */
WebOS.apps.terminal = {
  name: 'Terminal', icon: '⬛',
  create: function(win) {
    const app = document.createElement('div');
    app.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#0c0c0c;font-family:"Cascadia Code","Fira Code","Consolas",monospace;';

    const output = document.createElement('div');
    output.style.cssText = 'flex:1;overflow-y:auto;padding:12px;font-size:14px;line-height:1.5;color:#d4d4d4;white-space:pre-wrap;';

    const inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;align-items:center;padding:6px 12px;border-top:1px solid #222;background:#0c0c0c;';

    const promptSpan = document.createElement('span');
    promptSpan.textContent = '$ ';
    promptSpan.style.cssText = 'color:#569cd6;font-size:14px;flex-shrink:0;margin-right:4px;';

    const input = document.createElement('input');
    input.type = 'text';
    input.style.cssText = 'flex:1;border:none;background:transparent;color:#d4d4d4;font-size:14px;font-family:inherit;outline:none;';

    inputRow.appendChild(promptSpan);
    inputRow.appendChild(input);
    app.appendChild(output);
    app.appendChild(inputRow);

    let hist = [];
    let histIdx = -1;

    function print(text, cls) {
      const line = document.createElement('div');
      line.textContent = text;
      if (cls) line.style.color = cls;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    function printBanner() {
      print('╔══════════════════════════════════╗', '#569cd6');
      print('║       WebOS Terminal v1.0        ║', '#569cd6');
      print('╚══════════════════════════════════╝', '#569cd6');
      print('Type /help for commands, or enter WebLang code directly.');
      print('');
    }
    printBanner();

    function runWebLang(code) {
      const capture = document.createElement('div');
      capture.style.display = 'none';
      app.appendChild(capture);
      try {
        WebOS.lang.run(code, capture);
        const lines = capture.querySelectorAll('.wl-text');
        lines.forEach(el => print(el.textContent));
      } catch (e) {
        print('Error: ' + e.message, '#f48771');
      }
      app.removeChild(capture);
    }

    function processCmd(line) {
      const parts = line.split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      switch (cmd) {
        case '/help':
          print('Commands:', '#569cd6');
          print('  /help             - Show this help');
          print('  /clear            - Clear terminal');
          print('  /ls               - List files by folder');
          print('  /ls <folder>      - List files in a folder (system-apps/apps/files)');
          print('  /cat <path>       - Show file contents (e.g. /cat system-apps/counter.wl)');
          print('  /run <path>       - Run a WebLang app (e.g. /run system-apps/counter.wl)');
          print('  /echo <text>      - Print text');
          print('  /date             - Show date & time');
          print('  /whoami           - Show user info');
          print('  /neofetch         - System info');
          print('  /color <name>     - Set text color (green/amber/white)');
          print('  /reboot           - Simulate reboot');
          print('  /exit             - Close terminal');
          print('');
          print('Any other input runs as WebLang code.');
          break;
        case '/clear': output.innerHTML = ''; printBanner(); break;
        case '/ls':
          const allFs = JSON.parse(localStorage.getItem('webfs') || '{}');
          const allKeys = Object.keys(allFs);
          if (allKeys.length === 0) { print('No files found.'); break; }
          const folders = ['system-apps', 'apps', 'files'];
          if (args[0] && folders.includes(args[0])) {
            const prefix = args[0] + '/';
            const filtered = allKeys.filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length)).sort();
            if (filtered.length === 0) { print('  (' + args[0] + '/ is empty)'); }
            else { filtered.forEach(k => print('  ' + k + '  (' + allFs[args[0] + '/' + k].length + 'B)')); }
          } else {
            folders.forEach(f => {
              const prefix = f + '/';
              const filtered = allKeys.filter(k => k.startsWith(prefix)).map(k => '  ' + k.slice(prefix.length));
              if (filtered.length > 0) {
                print('  ' + f + '/:', '#569cd6');
                filtered.sort().forEach(k => print(k));
              }
            });
          }
          break;
        case '/cat':
          if (!args[0]) { print('Usage: /cat <folder/filename>', '#f48771'); break; }
          const fs2 = JSON.parse(localStorage.getItem('webfs') || '{}');
          if (fs2[args[0]]) { print(fs2[args[0]]); }
          else { print('File not found: ' + args[0], '#f48771'); }
          break;
        case '/run':
          if (!args[0]) { print('Usage: /run <folder/filename.wl>', '#f48771'); break; }
          const fs3 = JSON.parse(localStorage.getItem('webfs') || '{}');
          if (fs3[args[0]]) { print('Running ' + args[0] + '...', '#888'); runWebLang(fs3[args[0]]); }
          else { print('File not found: ' + args[0], '#f48771'); }
          break;
        case '/echo': print(args.join(' ') || ''); break;
        case '/date': print(new Date().toLocaleString()); break;
        case '/whoami': print('user@webos'); break;
        case '/neofetch':
          const appCount = Object.keys(WebOS.apps).length;
          const fileCount = Object.keys(JSON.parse(localStorage.getItem('webfs') || '{}')).length;
          print('       .---.       ', '#569cd6');
          print('      /     \\      ', '#569cd6');
          print('     | OS v1 |     ', '#569cd6');
          print('      \\     /      ', '#569cd6');
          print('       \'---\'       ', '#569cd6');
          print('  OS:      WebOS v1.0');
          print('  Kernel:  WebLang ' + WebLangRuntime.toString().length + ' bytes');
          print('  Apps:    ' + appCount + ' built-in');
          print('  Files:   ' + fileCount + ' saved');
          print('  Browser: ' + navigator.userAgent.split(' ').slice(-1));
          print('  Locale:  ' + navigator.language);
          break;
        case '/color':
          const c = args[0];
          if (c === 'green') { output.style.color = '#33ff33'; }
          else if (c === 'amber') { output.style.color = '#ffb000'; }
          else if (c === 'white') { output.style.color = '#d4d4d4'; }
          else { print('Colors: green, amber, white', '#888'); }
          break;
        case '/reboot':
          output.innerHTML = '';
          print('Rebooting...', '#888');
          setTimeout(() => {
            output.innerHTML = '';
            printBanner();
            [...OS.windows].forEach(w => w.close());
          }, 800);
          break;
        case '/export':
          const data = {
            version: 1,
            exported: new Date().toISOString(),
            files: JSON.parse(localStorage.getItem('webfs') || '{}'),
            wallpaper: localStorage.getItem('wallpaper') || '#2b2b2b',
            wallpaperImg: localStorage.getItem('wallpaper-img') || null,
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'webos-backup.json';
          a.click();
          URL.revokeObjectURL(a.href);
          print('Exported webos-backup.json (' + blob.size + ' bytes)', '#89d185');
          break;
        case '/import':
          const inp = document.createElement('input');
          inp.type = 'file'; inp.accept = '.json';
          inp.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              try {
                const d = JSON.parse(ev.target.result);
                if (d.files) { localStorage.setItem('webfs', JSON.stringify(d.files)); }
                if (d.wallpaper) { localStorage.setItem('wallpaper', d.wallpaper); }
                if (d.wallpaperImg) { localStorage.setItem('wallpaper-img', d.wallpaperImg); }
                else { localStorage.removeItem('wallpaper-img'); }
                OS.loadWallpaper();
                print('Import complete! ' + Object.keys(d.files || {}).length + ' files restored.', '#89d185');
              } catch(ex) { print('Import failed: ' + ex.message, '#f48771'); }
            };
            reader.readAsText(file);
          };
          inp.click();
          break;
        case '/exit': win.close(); break;
        default:
          if (cmd.startsWith('/')) {
            print('Unknown command: ' + cmd, '#f48771');
            print('Type /help for available commands');
          } else {
            runWebLang(line);
          }
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const line = input.value.trim();
        input.value = '';
        if (!line) return;
        print('$ ' + line);
        processCmd(line);
        hist.push(line);
        histIdx = hist.length;
        output.scrollTop = output.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        if (hist.length === 0) return;
        histIdx = Math.max(0, histIdx - 1);
        input.value = hist[histIdx];
      } else if (e.key === 'ArrowDown') {
        if (histIdx >= hist.length - 1) { histIdx = hist.length; input.value = ''; return; }
        histIdx = Math.min(hist.length - 1, histIdx + 1);
        input.value = hist[histIdx];
      }
    });

    setTimeout(() => input.focus(), 100);
    input.focus();

    return app;
  }
};

/* ===== WALKTHROUGH ===== */
WebOS.apps.walkthrough = {
  name: 'Walkthrough', icon: '📖',
  create: function(win) {
    const app = document.createElement('div');
    app.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1a1a2e;';

    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;padding:24px 32px;';

    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 24px;border-top:1px solid rgba(255,255,255,.08);background:#16162a;flex-shrink:0;';

    const dots = document.createElement('div');
    dots.style.cssText = 'flex:1;display:flex;gap:6px;';

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back';
    backBtn.style.cssText = 'padding:6px 14px;border-radius:4px;border:1px solid #555;color:#ccc;background:transparent;cursor:pointer;font-size:13px;';

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.style.cssText = 'padding:6px 14px;border-radius:4px;border:1px solid #555;color:#ccc;background:#3c3c3c;cursor:pointer;font-size:13px;';

    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip';
    skipBtn.style.cssText = 'padding:6px 14px;border-radius:4px;border:none;color:#888;background:transparent;cursor:pointer;font-size:12px;';

    footer.appendChild(skipBtn);
    footer.appendChild(dots);
    footer.appendChild(backBtn);
    footer.appendChild(nextBtn);
    app.appendChild(content);
    app.appendChild(footer);

    const steps = [
      {
        title: 'Welcome to WebOS',
        icon: '🖥️',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">WebOS is a browser-based operating system where <strong style="color:#569cd6;">you code your own software</strong> using <strong style="color:#569cd6;">WebLang</strong> — a custom language built right in.</p>
<p style="color:#888;font-size:13px;line-height:1.6;margin-top:12px;">This walkthrough will show you around. It takes about 2 minutes.</p>
<p style="color:#888;font-size:13px;line-height:1.6;">Click <strong>Next</strong> to start, or <strong>Skip</strong> to close.</p>`
      },
      {
        title: 'The Desktop',
        icon: '🖥️',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">The <strong style="color:#569cd6;">desktop</strong> is your home base.</p>
<ul style="color:#aaa;font-size:13px;line-height:2;margin-top:12px;padding-left:20px;">
  <li><strong style="color:#569cd6;">Double-click</strong> icons to launch apps</li>
  <li><strong style="color:#569cd6;">Right-click</strong> the desktop for quick actions</li>
  <li>The <strong style="color:#569cd6;">taskbar</strong> at the bottom shows open apps and the clock</li>
  <li>The <strong style="color:#569cd6;">Start</strong> button opens the app menu</li>
  <li>Windows can be <strong style="color:#569cd6;">dragged, resized, minimized, maximized, and closed</strong></li>
</ul>`
      },
      {
        title: 'Notepad',
        icon: '📝',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;"><strong style="color:#569cd6;">Notepad</strong> is a simple text editor.</p>
<p style="color:#aaa;font-size:13px;line-height:1.6;margin-top:12px;">Create text files, save them, and they'll be stored in your browser's localStorage. Files persist across sessions — close the tab and come back, they're still there.</p>
<p style="color:#888;font-size:13px;line-height:1.6;margin-top:12px;">Try it: double-click <strong>Notepad</strong> on the desktop and type something!</p>`
      },
      {
        title: 'Code Editor',
        icon: '💻',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">The <strong style="color:#569cd6;">Code Editor</strong> is where you write <strong>WebLang</strong> code.</p>
<p style="color:#aaa;font-size:13px;line-height:1.6;margin-top:12px;">Type code in the editor, click <strong style="color:#569cd6;">Run</strong> (▶) and see the output instantly. It's a live playground — no build step, no compilation.</p>
<p style="color:#aaa;font-size:13px;line-height:1.6;margin-top:12px;">Click <strong style="color:#569cd6;">Examples</strong> to load pre-built apps (Todo List, Calculator, Greeting App).</p>`
      },
      {
        title: 'WebLang Basics',
        icon: '💻',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">WebLang is easy to learn:</p>
<pre style="background:#0d0d0d;padding:12px;border-radius:6px;margin-top:12px;font-size:13px;color:#d4d4d4;line-height:1.6;white-space:pre-wrap;">
<code>count = 0
Text "Count: {count}" as display
Button "+" { count = count + 1; update display }</code></pre>
<p style="color:#aaa;font-size:13px;line-height:1.6;margin-top:12px;">Variables, UI elements (<strong style="color:#569cd6;">Text</strong>, <strong style="color:#569cd6;">Button</strong>, <strong style="color:#569cd6;">Input</strong>), string interpolation with <code style="background:#333;padding:1px 6px;border-radius:3px;">{variable}</code>, and <strong style="color:#569cd6;">update</strong> for reactive displays.</p>`
      },
      {
        title: 'Paint',
        icon: '🖌️',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">The <strong style="color:#569cd6;">Paint</strong> app lets you draw freely.</p>
<ul style="color:#aaa;font-size:13px;line-height:2;margin-top:12px;padding-left:20px;">
  <li>Choose from <strong style="color:#569cd6;">14 preset colors</strong> or use the color picker</li>
  <li>Adjust <strong style="color:#569cd6;">brush size</strong> (2px to 30px)</li>
  <li>Toggle <strong style="color:#569cd6;">Eraser</strong> mode</li>
  <li><strong style="color:#569cd6;">Undo</strong> up to 30 steps</li>
  <li><strong style="color:#569cd6;">Clear</strong> the canvas</li>
</ul>
<p style="color:#888;font-size:13px;line-height:1.6;margin-top:12px;">You can also build your own paint app in WebLang using the <strong style="color:#569cd6;">Canvas</strong> element with <code style="background:#333;padding:1px 6px;border-radius:3px;">onDown</code>/<code style="background:#333;padding:1px 6px;border-radius:3px;">onMove</code> events.</p>`
      },
      {
        title: 'Canvas Drawing API',
        icon: '🖌️',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">WebLang has a full <strong style="color:#569cd6;">Canvas Drawing API</strong>:</p>
<pre style="background:#0d0d0d;padding:12px;border-radius:6px;margin-top:12px;font-size:13px;color:#d4d4d4;line-height:1.6;">
<code>Canvas width:400 height:300 as c {
  onDown { set c.fillCircle = [mouseX, mouseY, 5] }
  onMove { set c.fillCircle = [mouseX, mouseY, 5] }
}</code></pre>
<p style="color:#aaa;font-size:13px;line-height:1.6;margin-top:12px;">Draw circles, rectangles, lines, text, paths — all using <code style="background:#333;padding:1px 6px;border-radius:3px;">set canvas.prop = [args]</code>.</p>`
      },
      {
        title: 'Terminal',
        icon: '⬛',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">The <strong style="color:#569cd6;">Terminal</strong> is a command line + WebLang REPL.</p>
<ul style="color:#aaa;font-size:13px;line-height:2;margin-top:12px;padding-left:20px;">
  <li>Type <strong style="color:#569cd6;">/help</strong> to see all commands</li>
  <li><strong style="color:#569cd6;">/ls</strong> lists files, <strong style="color:#569cd6;">/run file.wl</strong> runs apps</li>
  <li><strong style="color:#569cd6;">/neofetch</strong> shows system info</li>
  <li><strong style="color:#569cd6;">/export</strong> downloads your entire OS as a backup</li>
  <li><strong style="color:#569cd6;">/import</strong> restores a backup</li>
  <li>Anything else runs as <strong style="color:#569cd6;">WebLang code</strong></li>
</ul>`
      },
      {
        title: 'Files & Sharing',
        icon: '📁',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">The <strong style="color:#569cd6;">Files</strong> app shows all your saved files.</p>
<ul style="color:#aaa;font-size:13px;line-height:2;margin-top:12px;padding-left:20px;">
  <li>Click a <strong style="color:#569cd6;">.wl</strong> file to run it in a new window</li>
  <li><strong style="color:#569cd6;">Export All</strong> downloads everything as a .json backup</li>
  <li><strong style="color:#569cd6;">Import</strong> restores from a backup file</li>
</ul>
<p style="color:#aaa;font-size:13px;line-height:1.6;margin-top:12px;">The <strong style="color:#569cd6;">App Store</strong> lets you paste and run WebLang code from others, and save it as a .wl file.</p>`
      },
      {
        title: 'Wallpaper & Themes',
        icon: '🎨',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">The <strong style="color:#569cd6;">Wallpaper</strong> app customizes your desktop background.</p>
<ul style="color:#aaa;font-size:13px;line-height:2;margin-top:12px;padding-left:20px;">
  <li>Pick from <strong style="color:#569cd6;">8 preset colors</strong> or use the color picker</li>
  <li>Set a custom <strong style="color:#569cd6;">image URL</strong> as wallpaper</li>
  <li>Changes save automatically</li>
</ul>`
      },
      {
        title: "You're Ready!",
        icon: '🚀',
        body: `<p style="color:#aaa;font-size:14px;line-height:1.7;">That's the tour! Here's what you can do next:</p>
<ul style="color:#aaa;font-size:13px;line-height:2;margin-top:12px;padding-left:20px;">
  <li>Open the <strong style="color:#569cd6;">Code Editor</strong> and build something</li>
  <li>Load <strong style="color:#569cd6;">Examples</strong> and modify them</li>
  <li>Create a <strong style="color:#569cd6;">Paint</strong> app in WebLang with Canvas</li>
  <li><strong style="color:#569cd6;">Export</strong> your OS to move it to another browser</li>
  <li>Share your <strong style="color:#569cd6;">.wl</strong> files with friends</li>
</ul>
<p style="color:#888;font-size:13px;line-height:1.6;margin-top:12px;">Run this walkthrough anytime from the desktop icon.</p>`
      }
    ];

    let step = 0;

    function render() {
      const s = steps[step];
      content.innerHTML = `
        <div style="font-size:36px;margin-bottom:12px;">${s.icon}</div>
        <h2 style="font-weight:400;font-size:18px;color:#d4d4d4;margin-bottom:16px;">${s.title}</h2>
        ${s.body}
        <div style="margin-top:16px;color:#666;font-size:11px;">Step ${step + 1} of ${steps.length}</div>`;
      dots.innerHTML = steps.map((_, i) =>
        `<div style="width:8px;height:8px;border-radius:50%;background:${i === step ? '#569cd6' : '#333'};transition:background .2s;"></div>`
      ).join('');
      backBtn.style.display = step === 0 ? 'none' : '';
      nextBtn.textContent = step === steps.length - 1 ? 'Done' : 'Next';
      content.scrollTop = 0;
    }

    function go(n) {
      step = Math.max(0, Math.min(steps.length - 1, step + n));
      render();
    }

    function finish() {
      localStorage.setItem('walkthroughDone', 'true');
      win.close();
    }

    backBtn.onclick = () => go(-1);
    nextBtn.onclick = () => step === steps.length - 1 ? finish() : go(1);
    skipBtn.onclick = finish;
    render();

    return app;
  }
};

/* ===== OS INFO ===== */
WebOS.apps.info = {
  name: 'About WebOS', icon: 'ℹ️',
  create: function(win) {
    const app = document.createElement('div');
    app.style.cssText = 'padding:24px;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;text-align:center;';
    app.innerHTML = `
      <div style="font-size:48px;margin-bottom:8px;">🖥️</div>
      <h2 style="font-weight:400;font-size:20px;">WebOS</h2>
      <p style="color:#888;font-size:13px;max-width:320px;">A web-based operating system where you code your own software using WebLang — an easy-to-learn, hard-to-master language.</p>
      <div style="color:#666;font-size:12px;margin-top:8px;">
        <p>Built-in Apps: Notepad, Code Editor, Wallpaper, Files</p>
        <p style="margin-top:4px;">Create apps with WebLang and share them!</p>
      </div>
    `;
    return app;
  }
};

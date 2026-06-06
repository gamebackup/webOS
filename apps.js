/* Built-in WebOS Apps */

const WebOS = { apps: {}, lang: new WebLangRuntime() };

/* ===== NOTEPAD ===== */
WebOS.apps.notepad = {
  name: 'Notepad', icon: '📝',
  create: function(win) {
    const app = document.createElement('div');
    app.className = 'notepad-app';
    app.innerHTML = `
      <div class="notepad-toolbar">
        <button class="np-new">New</button>
        <button class="np-save">Save</button>
        <button class="np-save-as">Save As</button>
        <span class="filename">untitled.txt</span>
      </div>
      <textarea spellcheck="false"></textarea>`;
    const ta = app.querySelector('textarea');
    const fnSpan = app.querySelector('.filename');
    let currentFile = 'untitled.txt';

    const files = JSON.parse(localStorage.getItem('webfs') || '{}');
    if (files[currentFile]) { ta.value = files[currentFile]; }

    app.querySelector('.np-new').onclick = () => {
      if (ta.value && !confirm('Discard current file?')) return;
      ta.value = ''; currentFile = 'untitled.txt'; fnSpan.textContent = currentFile;
    };
    app.querySelector('.np-save').onclick = () => {
      const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
      fs[currentFile] = ta.value;
      localStorage.setItem('webfs', JSON.stringify(fs));
      win.title.textContent = currentFile;
    };
    app.querySelector('.np-save-as').onclick = () => {
      const name = prompt('Filename:', currentFile);
      if (!name) return;
      currentFile = name; fnSpan.textContent = name;
      const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
      fs[currentFile] = ta.value;
      localStorage.setItem('webfs', JSON.stringify(fs));
    };
    return app;
  }
};

/* ===== CODE EDITOR ===== */
WebOS.apps.codeditor = {
  name: 'Code Editor', icon: '💻',
  create: function(win) {
    const app = document.createElement('div');
    app.className = 'code-editor-app';
    const defaultCode = `// WebLang - Easy to learn, hard to master
// Create your first app:

Text "Welcome to WebLang!"
Text "Let's build something cool."

count = 0

Text "Count: {count}" as counter

Button "Click me!" {
  count = count + 1
  update
}

name = ""

Input name placeholder:"Your name"

Button "Greet" {
  if name != "" {
    Text "Hello, {name}! Welcome to WebOS."
  } else {
    Text "Please enter your name!"
  }
}

Button "Counter App Example" {
  // Launch a counter app inline
  Text "--- Counter ---"
  c = 0
  Text "Value: {c}" as disp
  Button "+" { c = c + 1; update disp }
  Button "-" { c = c - 1; update disp }
}
`;
    app.innerHTML = `
      <div class="code-editor-toolbar">
        <button class="ce-run">&#9654; Run</button>
        <button class="ce-clear">Clear Output</button>
        <button class="ce-new">New</button>
        <button class="ce-load-examples">Examples</button>
        <span class="status">Ready</span>
      </div>
      <div class="editor-pane">
        <textarea spellcheck="false">${defaultCode.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
      </div>
      <div class="code-editor-output" id="ce-output"></div>`;
    const textarea = app.querySelector('textarea');
    const output = app.querySelector('#ce-output');
    const status = app.querySelector('.status');

    app.querySelector('.ce-run').onclick = () => {
      const code = textarea.value;
      output.textContent = '';
      output.className = 'code-editor-output';
      status.textContent = 'Running...';
      try {
        WebOS.lang.runApp(code, output);
        status.textContent = 'Done';
        output.className = 'code-editor-output success';
      } catch (e) {
        output.textContent = 'Error: ' + e.message;
        output.className = 'code-editor-output error';
        status.textContent = 'Error';
      }
    };
    app.querySelector('.ce-clear').onclick = () => { output.textContent = ''; output.className = 'code-editor-output'; };
    app.querySelector('.ce-new').onclick = () => {
      if (textarea.value && !confirm('Clear editor?')) return;
      textarea.value = '// New WebLang app\n\nText "Hello WebLang!"\n';
      output.textContent = '';
      output.className = 'code-editor-output';
    };
    app.querySelector('.ce-load-examples').onclick = () => {
      const examples = [
        {
          name: 'Todo List',
          code: `// Todo List App
Text "My Todo List"

todos = []
newTask = ""

Input newTask placeholder:"Enter a task"

Button "Add" {
  if newTask != "" {
    todos = todos + [newTask]
    newTask = ""
    update
  }
}

Text "Tasks: {len(todos)}" as taskList

for i in len(todos) {
  Text "{i + 1}. {todos[i]}"
}
`
        },
        {
          name: 'Calculator',
          code: `// Simple Calculator
Text "Calculator" style:bold

a = 0
b = 0
result = 0

Input a placeholder:"First number"
Input b placeholder:"Second number"

Button "Add" { result = a + b; update result }
Button "Sub" { result = a - b; update result }
Button "Mul" { result = a * b; update result }
Button "Div" { result = a / b; update result }

Text "Result: {result}" as result
`
        },
        {
          name: 'Greeting App',
          code: `// Greeting App
Text "Greeting App" style:bold

name = ""
greeting = "Hello"

Input name placeholder:"Enter your name"

Button "Say Hello" {
  Text "{greeting}, {name}!"
}

Button "Change to Spanish" {
  greeting = "Hola"
}

Button "Change to French" {
  greeting = "Bonjour"
}
`
        }
      ];
      const choice = prompt('Load example:\n' + examples.map((e,i) => `${i+1}. ${e.name}`).join('\n') + '\n\nEnter number:');
      if (choice) {
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < examples.length) {
          textarea.value = examples[idx].code;
          output.textContent = '';
          status.textContent = 'Loaded: ' + examples[idx].name;
        } else {
          status.textContent = 'Invalid selection';
        }
      }
    };
    return app;
  }
};

/* ===== WALLPAPER ===== */
WebOS.apps.wallpaper = {
  name: 'Wallpaper', icon: '🎨',
  create: function(win) {
    const app = document.createElement('div');
    app.className = 'wallpaper-app';
    const presets = [
      { name:'Midnight', color:'#1a1a2e' },
      { name:'Ocean', color:'#0f3460' },
      { name:'Forest', color:'#1b4332' },
      { name:'Sunset', color:'#4a1942' },
      { name:'Slate', color:'#2d3748' },
      { name:'Matrix', color:'#0d0208' },
      { name:'Sky', color:'#1e3a5f' },
      { name:'Warm', color:'#3d2b1f' },
    ];
    app.innerHTML = `
      <h3>Background Color</h3>
      <div class="color-row">
        <input type="color" id="wp-color" value="#2b2b2b">
        <button id="wp-apply-color">Apply</button>
      </div>
      <h3>Presets</h3>
      <div class="presets">
        ${presets.map(p => `<div class="preset" data-color="${p.color}" style="background:${p.color}" title="${p.name}"></div>`).join('')}
      </div>
      <h3>Image URL</h3>
      <div class="img-url-row">
        <input type="text" id="wp-url" placeholder="https://example.com/wallpaper.jpg">
        <button id="wp-apply-url">Set Image</button>
        <button id="wp-clear-img">Clear</button>
      </div>
      <h3>Preview</h3>
      <div class="wallpaper-preview" id="wp-preview" style="background:${getCurrentBg()}">`;
    const desktop = document.getElementById('desktop');
    const preview = app.querySelector('#wp-preview');

    function getCurrentBg() {
      const bg = localStorage.getItem('wallpaper');
      return bg || '#2b2b2b';
    }

    function applyAll() {
      const bg = localStorage.getItem('wallpaper');
      const img = localStorage.getItem('wallpaper-img');
      if (img && img !== 'null') {
        desktop.style.backgroundImage = `url(${img})`;
        desktop.style.backgroundColor = 'transparent';
        preview.style.backgroundImage = `url(${img})`;
        preview.style.backgroundColor = 'transparent';
      } else {
        desktop.style.backgroundImage = 'none';
        desktop.style.backgroundColor = bg || '#2b2b2b';
        preview.style.backgroundImage = 'none';
        preview.style.backgroundColor = bg || '#2b2b2b';
      }
      app.querySelector('#wp-color').value = bg || '#2b2b2b';
    }

    app.querySelector('#wp-apply-color').onclick = () => {
      const color = app.querySelector('#wp-color').value;
      localStorage.setItem('wallpaper', color);
      localStorage.removeItem('wallpaper-img');
      applyAll();
    };
    app.querySelectorAll('.preset').forEach(el => {
      el.onclick = () => {
        const color = el.dataset.color;
        localStorage.setItem('wallpaper', color);
        localStorage.removeItem('wallpaper-img');
        applyAll();
      };
    });
    app.querySelector('#wp-apply-url').onclick = () => {
      const url = app.querySelector('#wp-url').value.trim();
      if (!url) return;
      localStorage.setItem('wallpaper-img', url);
      localStorage.setItem('wallpaper', '#1a1a2e');
      applyAll();
    };
    app.querySelector('#wp-clear-img').onclick = () => {
      localStorage.removeItem('wallpaper-img');
      applyAll();
    };
    applyAll();
    return app;
  }
};

/* ===== FILE MANAGER (simple) ===== */
WebOS.apps.files = {
  name: 'Files', icon: '📁',
  create: function(win) {
    const app = document.createElement('div');
    app.style.padding = '16px';
    app.innerHTML = `
      <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;">
        <h3 style="font-weight:400;flex:1;">Your Files</h3>
        <button id="fs-export" style="background:#3c3c3c;border:1px solid #555;color:#ccc;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Export All</button>
        <button id="fs-import" style="background:#3c3c3c;border:1px solid #555;color:#ccc;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Import</button>
      </div>
      <div id="file-list"></div>`;
    const list = app.querySelector('#file-list');

    app.querySelector('#fs-export').onclick = () => {
      const data = {
        version: 1, exported: new Date().toISOString(),
        files: JSON.parse(localStorage.getItem('webfs') || '{}'),
        wallpaper: localStorage.getItem('wallpaper') || '#2b2b2b',
        wallpaperImg: localStorage.getItem('wallpaper-img') || null,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'webos-backup.json'; a.click();
      URL.revokeObjectURL(a.href);
    };

    app.querySelector('#fs-import').onclick = () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json';
      inp.onchange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const d = JSON.parse(ev.target.result);
            if (d.files) localStorage.setItem('webfs', JSON.stringify(d.files));
            if (d.wallpaper) localStorage.setItem('wallpaper', d.wallpaper);
            if (d.wallpaperImg) localStorage.setItem('wallpaper-img', d.wallpaperImg);
            else localStorage.removeItem('wallpaper-img');
            OS.loadWallpaper(); refresh();
          } catch(ex) { alert('Import failed: ' + ex.message); }
        };
        reader.readAsText(file);
      };
      inp.click();
    };

    function refresh() {
      const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
      const keys = Object.keys(fs);
      list.innerHTML = '';
      if (keys.length === 0) { list.innerHTML = '<div style="color:#666;padding:20px;text-align:center;">No files yet. Save something in Notepad!</div>'; return; }
      keys.sort().forEach(name => {
        const item = document.createElement('div');
        Object.assign(item.style, { display:'flex', alignItems:'center', gap:'12px', padding:'8px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'13px' });
        item.innerHTML = `<span>📄</span><span>${name}</span><span style="margin-left:auto;color:#666;font-size:11px;">${(fs[name].length/1024).toFixed(1)} KB</span>`;
        item.onmouseenter = () => item.style.background = 'rgba(255,255,255,.05)';
        item.onmouseleave = () => item.style.background = 'transparent';
        item.onclick = () => {
          const code = fs[name];
          if (name.endsWith('.wl')) {
            const container = document.createElement('div');
            container.className = 'weblang-app';
            try { WebOS.lang.runApp(code, container); } catch(e) { container.innerHTML = `<div style="color:#f48771;">Error: ${e.message}</div>`; }
            win.openChild(name, container);
          } else {
            alert(`File: ${name}\n\n${code.slice(0,500)}${code.length > 500 ? '...' : ''}`);
          }
        };
        list.appendChild(item);
      });
    }
    refresh();
    return app;
  }
};

/* ===== APP STORE ===== */
WebOS.apps.store = {
  name: 'App Store', icon: '🏪',
  create: function(win) {
    const app = document.createElement('div');
    app.style.padding = '16px';
    app.innerHTML = `
      <h3 style="font-weight:400;margin-bottom:8px;">WebOS App Store</h3>
      <p style="color:#888;font-size:13px;margin-bottom:16px;">Install community apps by pasting their code below.</p>
      <textarea id="store-code" placeholder="Paste WebLang app code here..." style="width:100%;height:200px;background:#2d2d2d;border:1px solid #444;color:#ccc;border-radius:4px;padding:10px;font-family:monospace;font-size:13px;resize:vertical;"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button id="store-install" style="background:#3c3c3c;border:1px solid #555;color:#ccc;padding:8px 16px;border-radius:4px;cursor:pointer;">Install & Run</button>
        <button id="store-publish" style="background:#3c3c3c;border:1px solid #555;color:#ccc;padding:8px 16px;border-radius:4px;cursor:pointer;">Save as App</button>
      </div>
      <div id="store-output" style="margin-top:12px;"></div>`;
    const codeArea = app.querySelector('#store-code');
    const output = app.querySelector('#store-output');
    app.querySelector('#store-install').onclick = () => {
      output.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'weblang-app';
      try { WebOS.lang.runApp(codeArea.value, container); output.appendChild(container); }
      catch(e) { output.innerHTML = `<div style="color:#f48771;">Error: ${e.message}</div>`; }
    };
    app.querySelector('#store-publish').onclick = () => {
      const name = prompt('App name:');
      if (!name) return;
      const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
      fs[`${name}.wl`] = codeArea.value;
      localStorage.setItem('webfs', JSON.stringify(fs));
      output.innerHTML = `<div style="color:#89d185;">Saved as ${name}.wl!</div>`;
    };
    return app;
  }
};

/* ===== PAINT ===== */
WebOS.apps.paint = {
  name: 'Paint', icon: '🖌️',
  create: function(win) {
    const app = document.createElement('div');
    app.style.cssText = 'display:flex;flex-direction:column;height:100%;';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:6px;padding:6px 10px;background:#252525;border-bottom:1px solid #333;align-items:center;flex-wrap:wrap;flex-shrink:0;';

    const colors = ['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ff8800','#8800ff','#0088ff','#ff0088','#888888','#444444'];
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color'; colorPicker.value = '#000000';
    colorPicker.style.cssText = 'width:32px;height:32px;padding:1px;border:none;border-radius:4px;cursor:pointer;background:transparent;';
    toolbar.appendChild(colorPicker);

    const colorBtns = document.createElement('div');
    colorBtns.style.cssText = 'display:flex;gap:2px;';
    colors.forEach(c => {
      const btn = document.createElement('button');
      btn.style.cssText = `width:20px;height:20px;border-radius:3px;border:1px solid #555;cursor:pointer;background:${c};padding:0;`;
      if (c === '#000000') btn.style.borderColor = '#569cd6';
      btn.onclick = () => { colorPicker.value = c; activeColor = c; updateActiveColor(); };
      colorBtns.appendChild(btn);
    });
    toolbar.appendChild(colorBtns);

    toolbar.appendChild(document.createTextNode(' '));

    const brushSizes = [2, 4, 8, 12, 20, 30];
    let activeSize = 2;
    const sizeBtns = document.createElement('div');
    sizeBtns.style.cssText = 'display:flex;gap:4px;align-items:center;';
    brushSizes.forEach(s => {
      const btn = document.createElement('button');
      btn.textContent = s;
      btn.style.cssText = `width:28px;height:28px;border-radius:4px;border:1px solid #555;cursor:pointer;font-size:11px;color:#ccc;background:${s === activeSize ? '#3c3c3c' : 'transparent'};`;
      btn.onclick = () => { activeSize = s; sizeBtns.querySelectorAll('button').forEach(b => b.style.background = 'transparent'); btn.style.background = '#3c3c3c'; };
      sizeBtns.appendChild(btn);
    });
    toolbar.appendChild(sizeBtns);

    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = 'Eraser';
    eraserBtn.style.cssText = 'padding:4px 10px;border-radius:4px;border:1px solid #555;cursor:pointer;font-size:12px;color:#ccc;background:transparent;';
    eraserBtn.onclick = () => { isEraser = !isEraser; eraserBtn.style.background = isEraser ? '#555' : 'transparent'; colorPicker.value = getBgColor(); activeColor = getBgColor(); };
    toolbar.appendChild(eraserBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = 'padding:4px 10px;border-radius:4px;border:1px solid #555;cursor:pointer;font-size:12px;color:#ccc;background:transparent;';
    clearBtn.onclick = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); };
    toolbar.appendChild(clearBtn);

    const undoBtn = document.createElement('button');
    undoBtn.textContent = 'Undo';
    undoBtn.style.cssText = 'padding:4px 10px;border-radius:4px;border:1px solid #555;cursor:pointer;font-size:12px;color:#ccc;background:transparent;';
    toolbar.appendChild(undoBtn);

    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'flex:1;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1a1a;';

    const canvas = document.createElement('canvas');
    const rect = canvasWrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr; canvas.height = 600 * dpr;
    canvas.style.width = '800px'; canvas.style.height = '600px';
    canvas.style.cssText += ';cursor:crosshair;border-radius:4px;';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#000000';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    canvasWrap.appendChild(canvas);
    app.appendChild(toolbar);
    app.appendChild(canvasWrap);

    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let activeColor = '#000000';
    let isEraser = false;
    let hasDrawn = false;
    let undoStack = [];
    const maxUndo = 30;

    function getBgColor() {
      const bg = localStorage.getItem('wallpaper') || '#2b2b2b';
      return bg;
    }

    function updateActiveColor() {
      colorBtns.querySelectorAll('button').forEach(b => b.style.borderColor = b.style.background === activeColor ? '#569cd6' : '#555');
    }

    function saveState() {
      undoStack.push(canvas.toDataURL());
      if (undoStack.length > maxUndo) undoStack.shift();
    }

    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      lastX = e.clientX - r.left; lastY = e.clientY - r.top;
      isDrawing = true;
      hasDrawn = false;
      ctx.beginPath();
      ctx.arc(lastX, lastY, activeSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.fill();
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      if (!hasDrawn) { hasDrawn = true; saveState(); }
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      ctx.strokeStyle = isEraser ? getBgColor() : activeColor;
      ctx.lineWidth = activeSize;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x; lastY = y;
    });

    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });

    undoBtn.onclick = () => {
      if (undoStack.length === 0) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, 800, 600);
        ctx.drawImage(img, 0, 0);
        undoStack.pop();
      };
      img.src = undoStack[undoStack.length - 1];
    };

    return app;
  }
};

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
          print('  /ls               - List saved files');
          print('  /cat <file>       - Show file contents');
          print('  /run <file.wl>    - Run a WebLang app');
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
          const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
          const keys = Object.keys(fs);
          if (keys.length === 0) { print('No files found.'); }
          else { keys.sort().forEach(k => print('  ' + k + '  (' + fs[k].length + 'B)')); }
          break;
        case '/cat':
          if (!args[0]) { print('Usage: /cat <filename>', '#f48771'); break; }
          const fs2 = JSON.parse(localStorage.getItem('webfs') || '{}');
          if (fs2[args[0]]) { print(fs2[args[0]]); }
          else { print('File not found: ' + args[0], '#f48771'); }
          break;
        case '/run':
          if (!args[0]) { print('Usage: /run <filename.wl>', '#f48771'); break; }
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
        title: 'You're Ready!',
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

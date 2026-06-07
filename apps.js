/* WebOS Built-in Apps */

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
        <button class="np-saveas">Save As</button>
        <span class="np-filename">untitled.txt</span>
      </div>
      <textarea spellcheck="false"></textarea>`;
    const ta = app.querySelector('textarea');
    let currentFile = null;

    const loadList = () => {
      const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
      const files = Object.keys(fs).filter(k => k.startsWith('files/'));
      return files;
    };

    app.querySelector('.np-new').onclick = () => {
      if (ta.value && !confirm('Discard current document?')) return;
      ta.value = ''; currentFile = null;
      app.querySelector('.np-filename').textContent = 'untitled.txt';
    };
    app.querySelector('.np-save').onclick = () => {
      if (currentFile) {
        const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
        fs['files/' + currentFile] = ta.value;
        localStorage.setItem('webfs', JSON.stringify(fs));
        alert('Saved!');
      } else {
        app.querySelector('.np-saveas').click();
      }
    };
    app.querySelector('.np-saveas').onclick = () => {
      const name = prompt('File name:', currentFile || 'note.txt');
      if (name) {
        const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
        fs['files/' + name] = ta.value;
        localStorage.setItem('webfs', JSON.stringify(fs));
        currentFile = name;
        app.querySelector('.np-filename').textContent = name;
        alert('Saved as ' + name);
      }
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
    const defaultCode = ``;
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
          code: `// Todo List
todos = []
task = ""

Text "My Todo List"
Input task placeholder:"What needs to be done?"

Button "Add" {
  if task != "" {
    todos = todos + task
    task = ""
    update
  }
}

Text "Tasks: {len(todos)}" as count

for i in len(todos) {
  Text "{i + 1}. {todos[i]}"
}`
        },
        {
          name: 'Calculator',
          code: `// Calculator
a = 0
b = 0
result = 0

Text "Calculator"
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
Text "Greeting App"

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
        <button id="wp-apply-img">Set Image</button>
      </div>
      <button id="wp-reset" style="margin-top:12px;background:#3c3c3c;border:1px solid #555;color:#ccc;padding:8px 16px;border-radius:4px;cursor:pointer;">Reset to Default</button>`;
    app.querySelector('#wp-apply-color').onclick = () => {
      const c = app.querySelector('#wp-color').value;
      localStorage.setItem('wallpaper', c);
      localStorage.removeItem('wallpaper-img');
      OS.loadWallpaper();
    };
    app.querySelectorAll('.preset').forEach(el => {
      el.onclick = () => {
        localStorage.setItem('wallpaper', el.dataset.color);
        localStorage.removeItem('wallpaper-img');
        OS.loadWallpaper();
      };
    });
    app.querySelector('#wp-apply-img').onclick = () => {
      const url = app.querySelector('#wp-url').value.trim();
      if (url) { localStorage.setItem('wallpaper-img', url); OS.loadWallpaper(); }
    };
    app.querySelector('#wp-reset').onclick = () => {
      localStorage.removeItem('wallpaper');
      localStorage.removeItem('wallpaper-img');
      OS.loadWallpaper();
    };
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
      <h3>App Store</h3>
      <p style="color:#888;font-size:13px;margin-bottom:8px;">Paste WebLang code below and install or save it.</p>
      <textarea id="store-code" placeholder="Paste WebLang app code here..." style="width:100%;height:200px;background:#2d2d2d;border:1px solid #444;color:#ccc;border-radius:4px;padding:10px;font-family:monospace;font-size:13px;resize:vertical;"></textarea>
      <div style="margin-top:8px;display:flex;gap:8px;">
        <button id="store-run" style="background:#0078d4;border:none;color:#fff;padding:6px 16px;border-radius:4px;cursor:pointer;">Install & Run</button>
        <button id="store-save" style="background:#3c3c3c;border:1px solid #555;color:#ccc;padding:6px 16px;border-radius:4px;cursor:pointer;">Save as App</button>
      </div>
      <div id="store-output" style="margin-top:8px;"></div>`;
    const codeEl = app.querySelector('#store-code');
    const output = app.querySelector('#store-output');
    app.querySelector('#store-run').onclick = () => {
      const code = codeEl.value.trim();
      if (!code) { output.textContent = 'Paste some code first!'; return; }
      output.textContent = 'Running...';
      output.style.color = '#888';
      try {
        WebOS.lang.runApp(code, output);
        output.style.color = '#4ec9b0';
        output.textContent = 'App running above!';
      } catch(e) {
        output.style.color = '#f48771';
        output.textContent = 'Error: ' + e.message;
      }
    };
    app.querySelector('#store-save').onclick = () => {
      const code = codeEl.value.trim();
      if (!code) { output.textContent = 'Paste some code first!'; return; }
      const name = prompt('App name (without .wl):');
      if (name) {
        const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
        fs['apps/' + name + '.wl'] = code;
        localStorage.setItem('webfs', JSON.stringify(fs));
        output.style.color = '#4ec9b0';
        output.textContent = 'Saved as "' + name + '.wl" in Apps folder!';
      }
    };
    return app;
  }
};

/* ===== PAINT ===== */
WebOS.apps.paint = {
  name: 'Paint', icon: '🖌️',
  create: function(win) {
    const app = document.createElement('div');
    app.className = 'paint-app';
    const W = 700, H = 400;
    const dpr = window.devicePixelRatio || 1;
    app.innerHTML = `
      <canvas width="${W * dpr}" height="${H * dpr}" style="width:${W}px;height:${H}px;background:#fff;border:1px solid #333;display:block;cursor:crosshair;"></canvas>
      <div class="paint-toolbar">
        <div class="paint-colors">
          ${['#000','#fff','#f00','#0f0','#00f','#ff0','#f0f','#0ff','#888','#a52a2a','#ffa500','#800080','#ffc0cb','#00fa9a'].map(c => `<div class="paint-color" style="background:${c}"></div>`).join('')}
          <input type="color" class="paint-color" id="paint-custom" title="Custom">
        </div>
        <div class="paint-sizes">
          ${[2,4,6,10,16,24].map(s => `<div class="paint-size" data-size="${s}">${s}</div>`).join('')}
        </div>
        <button class="paint-eraser" title="Eraser">Eraser</button>
        <button class="paint-clear" title="Clear">Clear</button>
        <button class="paint-undo" title="Undo">Undo</button>
        <span class="paint-status">Brush</span>
      </div>`;
    const canvas = app.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,W,H);
    let drawing = false, color = '#000', size = 4, tool = 'brush';
    const undos = [];
    function saveState() { undos.push(ctx.getImageData(0,0,W*dpr,H*dpr)); if (undos.length > 30) undos.shift(); }
    function draw(x,y) {
      ctx.fillStyle = tool === 'eraser' ? '#fff' : color;
      ctx.beginPath(); ctx.arc(x,y,size/2,0,Math.PI*2); ctx.fill();
    }
    canvas.onmousedown = (e) => {
      drawing = true; saveState();
      draw(e.offsetX, e.offsetY);
    };
    canvas.onmousemove = (e) => { if (drawing) draw(e.offsetX, e.offsetY); };
    canvas.onmouseup = () => { drawing = false; };
    canvas.onmouseleave = () => { drawing = false; };
    app.querySelectorAll('.paint-color').forEach(el => {
      el.onclick = () => {
        const bg = el.style.background || el.value;
        if (bg) { color = bg; tool = 'brush'; app.querySelector('.paint-status').textContent = 'Brush'; }
      };
    });
    app.querySelectorAll('.paint-size').forEach(el => {
      el.onclick = () => { size = parseInt(el.dataset.size); app.querySelector('.paint-status').textContent = tool === 'eraser' ? 'Eraser' : 'Brush'; };
    });
    app.querySelector('.paint-eraser').onclick = () => { tool = 'eraser'; app.querySelector('.paint-status').textContent = 'Eraser'; };
    app.querySelector('.paint-clear').onclick = () => { saveState(); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H); };
    app.querySelector('.paint-undo').onclick = () => {
      if (undos.length) { ctx.putImageData(undos.pop(),0,0); }
    };
    return app;
  }
};

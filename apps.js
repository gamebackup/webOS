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
    let currentFile = 'files/untitled.txt';

    const files = JSON.parse(localStorage.getItem('webfs') || '{}');
    if (files[currentFile]) { ta.value = files[currentFile]; }

    app.querySelector('.np-new').onclick = () => {
      if (ta.value && !confirm('Discard current file?')) return;
      ta.value = ''; currentFile = 'files/untitled.txt'; fnSpan.textContent = 'untitled.txt';
    };
    app.querySelector('.np-save').onclick = () => {
      const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
      fs[currentFile] = ta.value;
      localStorage.setItem('webfs', JSON.stringify(fs));
      win.title.textContent = currentFile.replace(/^(files|apps|system-apps)\//, '');
    };
    app.querySelector('.np-save-as').onclick = () => {
      const name = prompt('Filename:', currentFile.replace('files/', ''));
      if (!name) return;
      currentFile = 'files/' + name; fnSpan.textContent = name;
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
      fs[`apps/${name}.wl`] = codeArea.value;
      localStorage.setItem('webfs', JSON.stringify(fs));
      output.innerHTML = `<div style="color:#89d185;">Saved as apps/${name}.wl!</div>`;
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

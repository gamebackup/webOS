/* WebOS Kernel - Window Manager & Desktop Environment */

const OS = {
  windows: [],
  idCounter: 0,
  zIndex: 100,
  activeWin: null,
  taskbarItems: new Map(),
  apps: {},
  desktopIcons: null,
  winContainer: null,
  taskbarItemsEl: null,
  startMenu: null,
  startBtn: null,
  clock: null,
  menuOpen: false,

  init() {
    this.desktopIcons = document.getElementById('desktop-icons');
    this.winContainer = document.getElementById('windows-container');
    this.taskbarItemsEl = document.getElementById('taskbar-items');
    this.startMenu = document.getElementById('start-menu');
    this.startBtn = document.getElementById('start-btn');
    this.clock = document.getElementById('clock');

    this.seedFilesystem();
    this.registerBuiltinApps();
    this.createDesktopIcons();
    this.setupTaskbar();
    if (!localStorage.getItem('walkthroughDone')) {
      setTimeout(() => this.launch('walkthrough'), 600);
    }
    this.setupContextMenu();
    this.setupKeybinds();
    this.tickClock();
    setInterval(() => this.tickClock(), 1000);
    document.getElementById('splash')?.classList.add('hidden');
    this.loadWallpaper();
  },

  seedFilesystem() {
    const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
    if (Object.keys(fs).length > 0) return;

    const defaults = {
      'counter.wl': `// Counter App
count = 0
Text "Counter: {count}" as display
Button "+" { count = count + 1; update display }
Button "-" { if count > 0 { count = count - 1 }; update display }
Button "Reset" { count = 0; update display }`,
      'todo.wl': `// Todo List
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
}`,
      'calculator.wl': `// Calculator
a = 0; b = 0; result = 0
Text "Calculator"
Input a placeholder:"First"
Input b placeholder:"Second"
Button "Add" { result = a + b; update }
Button "Sub" { result = a - b; update }
Button "Mul" { result = a * b; update }
Button "Div" { if b != 0 { result = a / b } else { result = "ERR" }; update }
Text "= {result}" as out`,
      'paint.wl': `// WebLang Painter
Canvas width:400 height:300 as canvas {
  onDown { set canvas.fillCircle = [mouseX, mouseY, 4] }
  onMove { set canvas.fillCircle = [mouseX, mouseY, 4] }
}
Button "Red"   { set canvas.fillStyle = "red" }
Button "Blue"  { set canvas.fillStyle = "blue" }
Button "Black" { set canvas.fillStyle = "black" }
Button "Clear" { set canvas.clear = [] }`,
      'dice.wl': `// Dice Roller
Text "Dice Roller"
Button "Roll!" {
  result = rand(1, 7)
  Text "You rolled a {result}!"
}`,
      'greeting.wl': `// Greeting App
name = ""; greeting = "Hello"
Text "Greeting App"
Input name placeholder:"Your name"
Button "Hi"  { Text "{greeting}, {name}!" }
Button "ES"  { greeting = "Hola" }
Button "FR"  { greeting = "Bonjour" }
Button "DE"  { greeting = "Hallo" }`,
    };
    for (let [name, code] of Object.entries(defaults)) {
      fs[name] = code;
    }
    localStorage.setItem('webfs', JSON.stringify(fs));
  },

  loadWallpaper() {
    const desktop = document.getElementById('desktop');
    const bg = localStorage.getItem('wallpaper');
    const img = localStorage.getItem('wallpaper-img');
    if (img && img !== 'null') { desktop.style.backgroundImage = `url(${img})`; desktop.style.backgroundColor = 'transparent'; }
    else { desktop.style.backgroundImage = 'none'; desktop.style.backgroundColor = bg || '#2b2b2b'; }
  },

  exportWebOS() {
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
  },

  importWebOS() {
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
          this.loadWallpaper();
          alert('Import complete! ' + Object.keys(d.files || {}).length + ' files restored. Restart to see changes.');
        } catch(ex) { alert('Import failed: ' + ex.message); }
      };
      reader.readAsText(file);
    };
    inp.click();
  },

  registerBuiltinApps() {
    for (let key in WebOS.apps) {
      this.apps[key] = WebOS.apps[key];
    }
  },

  createDesktopIcons() {
    const appList = [
      { id:'walkthrough', icon:'📖', label:'Walkthrough' },
      { id:'notepad', icon:'📝', label:'Notepad' },
      { id:'terminal', icon:'⬛', label:'Terminal' },
      { id:'paint', icon:'🖌️', label:'Paint' },
      { id:'codeditor', icon:'💻', label:'Code Editor' },
      { id:'wallpaper', icon:'🎨', label:'Wallpaper' },
      { id:'files', icon:'📁', label:'Files' },
      { id:'store', icon:'🏪', label:'App Store' },
    ];
    appList.forEach(a => {
      const icon = document.createElement('div');
      icon.className = 'desktop-icon';
      icon.innerHTML = `<div class="icon">${a.icon}</div><div class="label">${a.label}</div>`;
      icon.ondblclick = () => this.launch(a.id);
      this.desktopIcons.appendChild(icon);
    });
  },

  launch(appId, extraOpts) {
    const appDef = this.apps[appId];
    if (!appDef) { alert(`App "${appId}" not found`); return; }
    try {
      this.openWindow(appDef.name, appDef.icon, (win) => appDef.create(win), extraOpts);
    } catch (e) {
      alert(`Failed to launch ${appDef.name}: ${e.message}`);
    }
  },

  openWindow(title, icon, contentFn, extraOpts) {
    const id = ++this.idCounter;
    const z = ++this.zIndex;
    const win = document.createElement('div');
    win.className = 'window active';
    win.id = 'win-' + id;
    win.style.zIndex = z;
    win.style.width = (extraOpts?.width ?? 600) + 'px';
    win.style.height = (extraOpts?.height ?? 400) + 'px';
    win.style.left = (extraOpts?.left ?? (80 + (this.windows.length * 24) % 200)) + 'px';
    win.style.top = (extraOpts?.top ?? (40 + (this.windows.length * 24) % 160)) + 'px';

    win.innerHTML = `
      <div class="window-header">
        <span class="window-title">${icon || '📄'} ${title}</span>
        <div class="window-controls">
          <button class="win-min" title="Minimize"></button>
          <button class="win-max" title="Maximize"></button>
          <button class="win-close" title="Close"></button>
        </div>
      </div>
      <div class="window-body"></div>
      <div class="resize-handle"></div>
      <div class="resize-handle-tr"></div>
      <div class="resize-handle-tl"></div>
      <div class="resize-handle-bl"></div>
      <div class="resize-handle-t"></div>
      <div class="resize-handle-b"></div>
      <div class="resize-handle-l"></div>
      <div class="resize-handle-r"></div>`;

    this.winContainer.appendChild(win);

    const header = win.querySelector('.window-header');
    const body = win.querySelector('.window-body');
    const winTitle = win.querySelector('.window-title');

    const winObj = {
      id, el: win, title: winTitle, body, header,
      appId: null, data: {},
      _cleanup: [],
      minimized: false, maximized: false,
      openChild(name, contentEl) {
        const childOpts = {
          left: parseInt(win.style.left) + 30,
          top: parseInt(win.style.top) + 30,
          width: 500, height: 350
        };
        const childWin = OS.openWindow(name, '📄', (cw) => {
          cw.body.appendChild(contentEl);
          return cw.el;
        }, childOpts);
        return childWin;
      },
      close() {
        this._cleanup.forEach(fn => fn());
        const idx = OS.windows.indexOf(this);
        if (idx > -1) OS.windows.splice(idx, 1);
        win.remove();
        const tbi = OS.taskbarItems.get(id);
        if (tbi) { tbi.remove(); OS.taskbarItems.delete(id); }
        if (OS.activeWin === this) OS.activeWin = null;
      }
    };

    this.windows.push(winObj);

    // Mount app content
    try {
      const content = contentFn(winObj);
      if (content) body.appendChild(content);
    } catch (e) {
      body.innerHTML = `<div style="padding:20px;color:#f48771;">Error: ${e.message}</div>`;
    }

    this.addTaskbarItem(id, icon || '📄', title);
    this.setActive(id);

    // Window controls
    win.querySelector('.win-close').onclick = () => winObj.close();
    win.querySelector('.win-min').onmousedown = (e) => { e.stopPropagation(); this.minimizeWindow(id); };
    win.querySelector('.win-max').onmousedown = (e) => { e.stopPropagation(); this.maximizeWindow(id); };

    // Focus on click
    win.addEventListener('mousedown', () => this.setActive(id));

    // Drag
    this.makeDraggable(win, header, winObj);

    // Resize
    this.makeResizable(win, winObj);

    return winObj;
  },

  setActive(id) {
    const win = this.windows.find(w => w.id === id);
    if (!win) return;
    this.activeWin = win;
    win.el.style.zIndex = ++this.zIndex;
    this.windows.forEach(w => w.el.classList.toggle('active', w.id === id));
    this.taskbarItems.forEach((el, tid) => el.classList.toggle('active', tid === id));
  },

  minimizeWindow(id) {
    const win = this.windows.find(w => w.id === id);
    if (!win) return;
    win.minimized = !win.minimized;
    win.el.classList.toggle('minimized');
    const tbi = this.taskbarItems.get(id);
    if (tbi) tbi.classList.remove('active');
  },

  maximizeWindow(id) {
    const win = this.windows.find(w => w.id === id);
    if (!win) return;
    if (win.maximized) {
      win.el.classList.remove('maximized');
      if (win._savedRect) {
        win.el.style.left = win._savedRect.left + 'px';
        win.el.style.top = win._savedRect.top + 'px';
        win.el.style.width = win._savedRect.width + 'px';
        win.el.style.height = win._savedRect.height + 'px';
      }
      win.maximized = false;
    } else {
      win._savedRect = {
        left: parseInt(win.el.style.left),
        top: parseInt(win.el.style.top),
        width: parseInt(win.el.style.width),
        height: parseInt(win.el.style.height)
      };
      win.el.classList.add('maximized');
      win.maximized = true;
    }
  },

  addTaskbarItem(id, icon, title) {
    const item = document.createElement('div');
    item.className = 'taskbar-item';
    item.innerHTML = `<span class="tbi-icon">${icon}</span><span class="tbi-title">${title}</span>`;
    item.onclick = () => {
      const win = this.windows.find(w => w.id === id);
      if (!win) return;
      if (win.minimized) { win.minimized = false; win.el.classList.remove('minimized'); this.setActive(id); }
      else if (this.activeWin?.id === id) { this.minimizeWindow(id); }
      else { this.setActive(id); }
    };
    this.taskbarItemsEl.appendChild(item);
    this.taskbarItems.set(id, item);
  },

  makeDraggable(win, handle, winObj) {
    let dragging = false, startX, startY, startLeft, startTop;
    const dragAc = new AbortController();
    const dragOpts = { signal: dragAc.signal };
    winObj._cleanup.push(() => dragAc.abort());
    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      if (winObj.maximized) return;
      dragging = true;
      handle.classList.add('dragging');
      const rect = win.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startLeft = rect.left; startTop = rect.top;
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      win.style.left = (startLeft + e.clientX - startX) + 'px';
      win.style.top = (startTop + e.clientY - startY) + 'px';
    }, dragOpts);
    document.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; handle.classList.remove('dragging'); }
    }, dragOpts);
  },

  makeResizable(win, winObj) {
    const handles = {
      'resize-handle': ['right','bottom'],
      'resize-handle-tr': ['right','top'],
      'resize-handle-tl': ['left','top'],
      'resize-handle-bl': ['left','bottom'],
      'resize-handle-t': ['top'],
      'resize-handle-b': ['bottom'],
      'resize-handle-l': ['left'],
      'resize-handle-r': ['right'],
    };
    const resizeAc = new AbortController();
    const resizeOpts = { signal: resizeAc.signal };
    winObj._cleanup.push(() => resizeAc.abort());
    Object.entries(handles).forEach(([cls, dirs]) => {
      const el = win.querySelector('.' + cls);
      if (!el) return;
      el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (winObj.maximized) return;
        const rect = win.getBoundingClientRect();
        const startX = e.clientX, startY = e.clientY;
        const startW = rect.width, startH = rect.height;
        const startL = rect.left, startT = rect.top;
        const resize = (me) => {
          const dx = me.clientX - startX, dy = me.clientY - startY;
          if (dirs.includes('right')) { win.style.width = Math.max(300, startW + dx) + 'px'; }
          if (dirs.includes('left')) { const w = Math.max(300, startW - dx); win.style.left = (startL + startW - w) + 'px'; win.style.width = w + 'px'; }
          if (dirs.includes('bottom')) { win.style.height = Math.max(200, startH + dy) + 'px'; }
          if (dirs.includes('top')) { const h = Math.max(200, startH - dy); win.style.top = (startT + startH - h) + 'px'; win.style.height = h + 'px'; }
        };
        const stopResize = () => { document.removeEventListener('mousemove', resize); document.removeEventListener('mouseup', stopResize); };
        document.addEventListener('mousemove', resize, resizeOpts);
        document.addEventListener('mouseup', stopResize, resizeOpts);
      });
    });
  },

  setupTaskbar() {
    this.startBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggleMenu();
    };
    document.addEventListener('click', (e) => {
      if (!this.startMenu.contains(e.target) && e.target !== this.startBtn) {
        this.closeMenu();
      }
    });
    this.buildStartMenu();
  },

  buildStartMenu() {
    const content = document.getElementById('start-menu-content');
    const items = [
      { id:'walkthrough', icon:'📖', label:'Walkthrough', desc:'Interactive tour of WebOS' },
      { id:'notepad', icon:'📝', label:'Notepad', desc:'Simple text editor' },
      { id:'terminal', icon:'⬛', label:'Terminal', desc:'Command line & WebLang REPL' },
      { id:'paint', icon:'🖌️', label:'Paint', desc:'Drawing & painting' },
      { id:'codeditor', icon:'💻', label:'Code Editor', desc:'Write & run WebLang apps' },
      { id:'wallpaper', icon:'🎨', label:'Wallpaper', desc:'Customize desktop background' },
      { id:'files', icon:'📁', label:'Files', desc:'Browse your saved files' },
      { id:'store', icon:'🏪', label:'App Store', desc:'Install community apps' },
    ];
    // Separator
    const more = [
      { id:'info', icon:'ℹ️', label:'About WebOS', desc:'Version info' },
    ];
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'start-menu-item';
      el.innerHTML = `<span class="smi-icon">${item.icon}</span><div><div>${item.label}</div><div class="smi-desc">${item.desc}</div></div>`;
      el.onclick = () => { this.launch(item.id); this.closeMenu(); };
      content.appendChild(el);
    });
    const sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:rgba(255,255,255,.08);margin:4px 0;';
    content.appendChild(sep);
    more.forEach(item => {
      const el = document.createElement('div');
      el.className = 'start-menu-item';
      el.innerHTML = `<span class="smi-icon">${item.icon}</span><div><div>${item.label}</div><div class="smi-desc">${item.desc}</div></div>`;
      el.onclick = () => { this.launch(item.id); this.closeMenu(); };
      content.appendChild(el);
    });
  },

  toggleMenu() { this.menuOpen ? this.closeMenu() : this.openMenu(); },
  openMenu() { this.startMenu.classList.remove('hidden'); this.menuOpen = true; },
  closeMenu() { this.startMenu.classList.add('hidden'); this.menuOpen = false; },

  setupContextMenu() {
    const ctx = document.getElementById('context-menu');
    document.getElementById('desktop').addEventListener('contextmenu', (e) => {
      e.preventDefault();
      ctx.style.display = 'block';
      ctx.style.left = e.clientX + 'px';
      ctx.style.top = e.clientY + 'px';
      ctx.innerHTML = `
        <div class="ctx-item" data-action="new-note">New Text File</div>
        <div class="ctx-item" data-action="new-wl">New WebLang App</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item" data-action="export">Export WebOS</div>
        <div class="ctx-item" data-action="import">Import WebOS</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item" data-action="change-bg">Change Wallpaper</div>
      `;
    });
    ctx.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      ctx.style.display = 'none';
      if (action === 'new-note') { this.launch('notepad'); }
      else if (action === 'new-wl') { this.launch('codeditor'); }
      else if (action === 'change-bg') { this.launch('wallpaper'); }
      else if (action === 'export') { this.exportWebOS(); }
      else if (action === 'import') { this.importWebOS(); }
    });
    document.addEventListener('click', () => { ctx.style.display = 'none'; });
  },

  setupKeybinds() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.menuOpen) this.closeMenu();
      }
    });
  },

  tickClock() {
    const now = new Date();
    this.clock.textContent = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => OS.init());

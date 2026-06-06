/* WebOS File Manager */

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

    const folders = [
      { id: 'system-apps', label: 'System Apps', icon: '⚙️', desc: 'Built-in WebLang apps' },
      { id: 'apps', label: 'Apps', icon: '📦', desc: 'Apps uploaded via App Store' },
      { id: 'files', label: 'Files', icon: '📄', desc: 'Documents created in Notepad' },
    ];

    let currentFolder = null;

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
            OS.loadWallpaper(); render();
          } catch(ex) { alert('Import failed: ' + ex.message); }
        };
        reader.readAsText(file);
      };
      inp.click();
    };

    function getFilesInFolder(folderId) {
      const fs = JSON.parse(localStorage.getItem('webfs') || '{}');
      const prefix = folderId + '/';
      const result = {};
      for (const [key, value] of Object.entries(fs)) {
        if (key.startsWith(prefix)) {
          result[key.slice(prefix.length)] = value;
        }
      }
      return result;
    }

    function render() {
      if (currentFolder === null) {
        renderFolders();
      } else {
        renderFolderContents();
      }
    }

    function renderFolders() {
      list.innerHTML = '';
      folders.forEach(f => {
        const files = getFilesInFolder(f.id);
        const count = Object.keys(files).length;
        const item = document.createElement('div');
        Object.assign(item.style, {
          display:'flex', alignItems:'center', gap:'12px', padding:'12px',
          borderRadius:'6px', cursor:'pointer', fontSize:'14px',
          border:'1px solid rgba(255,255,255,.06)', marginBottom:'6px',
        });
        item.innerHTML = `
          <span style="font-size:28px;">${f.icon}</span>
          <div style="flex:1;">
            <div style="color:#d4d4d4;">${f.label}</div>
            <div style="color:#888;font-size:12px;margin-top:2px;">${f.desc} (${count} items)</div>
          </div>
          <span style="color:#666;font-size:20px;">›</span>`;
        item.onmouseenter = () => item.style.background = 'rgba(255,255,255,.05)';
        item.onmouseleave = () => item.style.background = 'transparent';
        item.onclick = () => { currentFolder = f.id; render(); };
        list.appendChild(item);
      });
    }

    function renderFolderContents() {
      const folder = folders.find(f => f.id === currentFolder);
      list.innerHTML = '';

      const header = document.createElement('div');
      Object.assign(header.style, {
        display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px',
        fontSize:'14px',
      });
      const backBtn = document.createElement('button');
      backBtn.textContent = '← Back';
      backBtn.style.cssText = 'background:transparent;border:1px solid #555;color:#ccc;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;';
      backBtn.onclick = () => { currentFolder = null; render(); };
      header.appendChild(backBtn);
      const title = document.createElement('span');
      title.textContent = `${folder.icon} ${folder.label}`;
      title.style.cssText = 'color:#d4d4d4;font-weight:bold;';
      header.appendChild(title);
      list.appendChild(header);

      const files = getFilesInFolder(currentFolder);
      const keys = Object.keys(files);
      if (keys.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'color:#666;padding:30px;text-align:center;font-size:13px;';
        empty.textContent = 'This folder is empty.';
        list.appendChild(empty);
        return;
      }
      keys.sort().forEach(name => {
        const item = document.createElement('div');
        Object.assign(item.style, {
          display:'flex', alignItems:'center', gap:'12px', padding:'8px 12px',
          borderRadius:'4px', cursor:'pointer', fontSize:'13px',
        });
        const isWl = name.endsWith('.wl');
        item.innerHTML = `<span>${isWl ? '📜' : '📄'}</span><span>${name}</span>
          <span style="margin-left:auto;color:#666;font-size:11px;">${(files[name].length/1024).toFixed(1)} KB</span>`;
        item.onmouseenter = () => item.style.background = 'rgba(255,255,255,.05)';
        item.onmouseleave = () => item.style.background = 'transparent';
        item.onclick = () => {
          const code = files[name];
          if (isWl) {
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

    render();
    return app;
  }
};

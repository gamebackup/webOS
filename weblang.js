/* WebLang v1 - Custom language for WebOS */

class WebLangLexer {
  constructor(src) { this.src = src; this.pos = 0; this.tokens = []; }
  tokenize() {
    while (this.pos < this.src.length) {
      let ch = this.src[this.pos];
      if (ch === '/' && this.src[this.pos + 1] === '/') { this.skipLine(); continue; }
      if (ch === '/' && this.src[this.pos + 1] === '*') { this.skipBlockComment(); continue; }
      if (ch === '\n' || ch === ' ' || ch === '\t' || ch === '\r') { this.pos++; continue; }
      if (ch === '"') { this.readString(); continue; }
      if (/\d/.test(ch)) { this.readNumber(); continue; }
      if (/[a-zA-Z_]/.test(ch)) { this.readIdentifier(); continue; }
      if ('{}()[]:.'.includes(ch)) { this.tokens.push({t:'PUNCT',v:ch}); this.pos++; continue; }
      if (ch === ',') { this.tokens.push({t:'PUNCT',v:','}); this.pos++; continue; }
      let op = this.readOperator();
      if (op) { this.tokens.push({t:'OP',v:op}); continue; }
      this.pos++;
    }
    this.tokens.push({t:'EOF',v:null});
    return this.tokens;
  }
  skipLine() { while (this.pos < this.src.length && this.src[this.pos] !== '\n') this.pos++; }
  skipBlockComment() { this.pos += 2; while (this.pos < this.src.length - 1 && !(this.src[this.pos] === '*' && this.src[this.pos+1] === '/')) this.pos++; this.pos += 2; }
  readString() {
    this.pos++; let s = '';
    while (this.pos < this.src.length && this.src[this.pos] !== '"') {
      if (this.src[this.pos] === '\\') {
        this.pos++;
        const esc = this.src[this.pos];
        if (esc === 'n') s += '\n';
        else if (esc === 't') s += '\t';
        else if (esc === 'r') s += '\r';
        else if (esc === '\\') s += '\\';
        else if (esc === '"') s += '"';
        else s += esc;
        this.pos++;
      } else { s += this.src[this.pos]; this.pos++; }
    }
    this.pos++;
    this.tokens.push({t:'STRING',v:s});
  }
  readNumber() {
    let n = '', dotSeen = false;
    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];
      if (ch === '.') { if (dotSeen) break; dotSeen = true; n += ch; this.pos++; }
      else if (/\d/.test(ch)) { n += ch; this.pos++; }
      else break;
    }
    this.tokens.push({t:'NUMBER',v:parseFloat(n)});
  }
  readIdentifier() {
    let id = '';
    while (this.pos < this.src.length && /[a-zA-Z0-9_]/.test(this.src[this.pos])) { id += this.src[this.pos]; this.pos++; }
    const kw = ['app','if','else','for','in','true','false','null','update','set','as','return','function','onDown','onMove','onUp'];
    this.tokens.push({t: kw.includes(id) ? 'KW' : 'ID', v: id});
  }
  readOperator() {
    const ops = ['==','!=','<=','>=','&&','||','+=','-=','*=','/=','->','=','+','-','*','/','<','>','!'];
    for (let o of ops) {
      if (this.src.slice(this.pos, this.pos + o.length) === o) { this.pos += o.length; return o; }
    }
    return null;
  }
}

class WebLangParser {
  constructor(tokens) { this.tokens = tokens; this.i = 0; }
  peek() { return this.tokens[this.i] || {t:'EOF',v:null}; }
  next() { return this.tokens[this.i++] || {t:'EOF',v:null}; }
  expect(t,v) {
    const tok = this.next();
    if (tok.t !== t || (v !== undefined && tok.v !== v)) throw new Error(`Expected ${t} ${v} got ${tok.t}:${tok.v} at token ${this.i}`);
    return tok;
  }
  parse() { const stmts = []; while (this.peek().t !== 'EOF') stmts.push(this.statement()); return {t:'Program',stmts}; }
  statement() {
    const tok = this.peek();
    if (tok.t === 'KW') {
      switch (tok.v) {
        case 'app': return this.appDefinition();
        case 'if': return this.ifStatement();
        case 'for': return this.forStatement();
        case 'return': this.next(); return {t:'Return',val: this.peek().t !== 'EOF' && this.peek().v !== '}' ? this.expression() : null};
        case 'update': this.next(); return {t:'Update',target: this.peek().t === 'EOF' || this.peek().v === '}' ? null : this.expression()};
        case 'set': return this.setStatement();
        case 'function': return this.functionDefinition();
        case 'onDown': case 'onMove': case 'onUp': return this.eventHandler();
        default: throw new Error(`Unexpected keyword ${tok.v}`);
      }
    }
    if (tok.t === 'ID') {
      const etype = this.elementType();
      if (etype) return this.elementStatement(etype);
      if (this.tokens[this.i+1] && this.tokens[this.i+1].t === 'OP' && ['=','+=','-=','*=','/='].includes(this.tokens[this.i+1].v)) {
        return this.assignment();
      }
      return {t:'ExprStmt',expr: this.expression()};
    }
    if (tok.t === 'KW' || tok.t === 'OP' || tok.t === 'STRING' || tok.t === 'NUMBER') {
      return {t:'ExprStmt',expr: this.expression()};
    }
    throw new Error(`Unexpected token ${tok.t}:${tok.v}`);
  }
  elementType() {
    const types = ['Text','Button','Input','Textarea','Image','Container','Link','List','Canvas'];
    const tok = this.peek();
    if (tok.t === 'ID' && types.includes(tok.v)) {
      this.next();
      return tok.v;
    }
    return null;
  }
  elementStatement(type) {
    let textExpr = null;
    const nxt = this.peek();
    if (nxt.t === 'STRING' || nxt.t === 'NUMBER' || nxt.t === 'ID' || (nxt.t === 'OP' && nxt.v === '-')) {
      textExpr = this.expression();
    }
    let props = [];
    while (this.peek().t === 'ID' && this.tokens[this.i+1] && this.tokens[this.i+1].v === ':') {
      const key = this.next().v;
      this.next();
      const val = this.expression();
      props.push({key,val});
    }
    if (this.peek().t === 'KW' && this.peek().v === 'as') {
      this.next();
      const name = this.expect('ID').v;
      props.push({key:'wl-id', val: {t:'Str', v: name}});
    }
    let body = null;
    if (this.peek().v === '{') { this.next(); body = []; while (this.peek().v !== '}') body.push(this.statement()); this.next(); }
    return {t:'Element',type,text:textExpr,props,body};
  }
  assignment() {
    const name = this.next().v;
    const op = this.next().v;
    const val = this.expression();
    return {t:'Assign',name,op,val};
  }
  setStatement() {
    this.next();
    const obj = this.expression();
    this.expect('PUNCT','.');
    const prop = this.next().v;
    this.expect('OP','=');
    const val = this.expression();
    return {t:'Set',obj,prop,val};
  }
  ifStatement() {
    this.next();
    const cond = this.expression();
    this.expect('PUNCT','{');
    const thenBody = [];
    while (this.peek().v !== '}') thenBody.push(this.statement());
    this.next();
    let elseBody = null;
    if (this.peek().t === 'KW' && this.peek().v === 'else') {
      this.next();
      if (this.peek().t === 'KW' && this.peek().v === 'if') { elseBody = [this.ifStatement()]; }
      else { this.expect('PUNCT','{'); elseBody = []; while (this.peek().v !== '}') elseBody.push(this.statement()); this.next(); }
    }
    return {t:'If',cond,thenBody,elseBody};
  }
  forStatement() {
    this.next();
    const varName = this.expect('ID').v;
    this.expect('KW','in');
    const iterable = this.expression();
    this.expect('PUNCT','{');
    const body = [];
    while (this.peek().v !== '}') body.push(this.statement());
    this.next();
    return {t:'For',varName,iterable,body};
  }
  eventHandler() {
    const eventType = this.next().v;
    this.expect('PUNCT','{');
    const body = [];
    while (this.peek().v !== '}') body.push(this.statement());
    this.next();
    return {t:'EventHandler', eventType, body};
  }
  appDefinition() {
    this.next();
    const name = this.expression();
    this.expect('PUNCT','{');
    const body = [];
    while (this.peek().v !== '}') body.push(this.statement());
    this.next();
    return {t:'App',name,body};
  }
  functionDefinition() {
    this.next();
    const name = this.expect('ID').v;
    this.expect('PUNCT','(');
    const params = [];
    while (this.peek().v !== ')') {
      params.push(this.expect('ID').v);
      if (this.peek().v === ',') this.next();
    }
    this.next();
    this.expect('PUNCT','{');
    const body = [];
    while (this.peek().v !== '}') body.push(this.statement());
    this.next();
    return {t:'Function',name,params,body};
  }
  expression() { return this.logicalOr(); }
  logicalOr() {
    let left = this.logicalAnd();
    while (this.peek().t === 'OP' && this.peek().v === '||') { this.next(); left = {t:'Binary',op:'||',left,right:this.logicalAnd()}; }
    return left;
  }
  logicalAnd() {
    let left = this.equality();
    while (this.peek().t === 'OP' && this.peek().v === '&&') { this.next(); left = {t:'Binary',op:'&&',left,right:this.equality()}; }
    return left;
  }
  equality() {
    let left = this.comparison();
    while (this.peek().t === 'OP' && (this.peek().v === '==' || this.peek().v === '!=')) { const op = this.next().v; left = {t:'Binary',op,left,right:this.comparison()}; }
    return left;
  }
  comparison() {
    let left = this.addition();
    while (this.peek().t === 'OP' && ['<','>','<=','>='].includes(this.peek().v)) { const op = this.next().v; left = {t:'Binary',op,left,right:this.addition()}; }
    return left;
  }
  addition() {
    let left = this.multiplication();
    while (this.peek().t === 'OP' && (this.peek().v === '+' || this.peek().v === '-')) { const op = this.next().v; left = {t:'Binary',op,left,right:this.multiplication()}; }
    return left;
  }
  multiplication() {
    let left = this.unary();
    while (this.peek().t === 'OP' && (this.peek().v === '*' || this.peek().v === '/')) { const op = this.next().v; left = {t:'Binary',op,left,right:this.unary()}; }
    return left;
  }
  unary() {
    if (this.peek().t === 'OP' && this.peek().v === '!') { this.next(); return {t:'Unary',op:'!',right:this.unary()}; }
    return this.call();
  }
  call() {
    let expr = this.primary();
    while (this.peek().v === '(' || this.peek().v === '[') {
      if (this.peek().v === '(') {
        this.next();
        const args = [];
        while (this.peek().v !== ')') { args.push(this.expression()); if (this.peek().v === ',') this.next(); }
        this.next();
        expr = {t:'Call',callee:expr,args};
      } else {
        this.next();
        const idx = this.expression();
        this.expect('PUNCT', ']');
        expr = {t:'Index',obj:expr,index:idx};
      }
    }
    return expr;
  }
  primary() {
    const tok = this.peek();
    if (tok.t === 'NUMBER') { this.next(); return {t:'Num',v:tok.v}; }
    if (tok.t === 'STRING') { this.next(); return {t:'Str',v:tok.v}; }
    if (tok.t === 'ID') { this.next(); return {t:'Ident',v:tok.v}; }
    if (tok.t === 'KW' && (tok.v === 'true' || tok.v === 'false')) { this.next(); return {t:'Bool',v:tok.v==='true'}; }
    if (tok.t === 'KW' && tok.v === 'null') { this.next(); return {t:'Null'}; }
    if (tok.v === '(') { this.next(); const e = this.expression(); this.expect('PUNCT',')'); return e; }
    if (tok.v === '[') { this.next(); const arr = []; while (this.peek().v !== ']') { arr.push(this.expression()); if (this.peek().v === ',') this.next(); } this.next(); return {t:'Array', elements: arr}; }
    if (tok.t === 'OP' && tok.v === '-') { this.next(); return {t:'Unary',op:'-',right:this.primary()}; }
    throw new Error(`Unexpected token in expression: ${tok.t}:${tok.v}`);
  }
}

class WebLangInterpreter {
  constructor(outputEl) {
    this.outputEl = outputEl;
    this.global = { $appName: 'Untitled', $vars: {}, $functions: {} };
    this.envStack = [this.global];
    this._programStmts = null;
    this._rerunning = false;
  }
  get env() { return this.envStack[this.envStack.length - 1]; }

  error(msg) { throw new Error(msg); }

  eval(ast) {
    if (Array.isArray(ast)) {
      let result = null;
      for (let stmt of ast) result = this.eval(stmt);
      return result;
    }
    switch (ast.t) {
      case 'Program': return this.eval(ast.stmts);
      case 'Num': return ast.v;
      case 'Str': return this.interpolate(ast.v);
      case 'Bool': return ast.v;
      case 'Null': return null;
      case 'Ident': return this.resolveVar(ast.v);
      case 'ExprStmt': return this.eval(ast.expr);
      case 'Binary': return this.evalBinary(ast);
      case 'Unary': return this.evalUnary(ast);
      case 'Call': return this.evalCall(ast);
      case 'Assign': return this.evalAssign(ast);
      case 'Set': return this.evalSet(ast);
      case 'Index': return this.eval(ast.obj)[this.eval(ast.index)];
      case 'Array': return ast.elements.map(e => this.eval(e));
      case 'Element': return this.createElement(ast);
      case 'If': return this.evalIf(ast);
      case 'For': return this.evalFor(ast);
      case 'App': return this.evalApp(ast);
      case 'Function': return this.evalFunction(ast);
      case 'EventHandler': return ast; // collected by canvas body handler
      case 'Update': return this.evalUpdate(ast);
      case 'Return': return {t:'ReturnVal',val: ast.val ? this.eval(ast.val) : null};
      default: throw new Error(`Unknown AST node: ${ast.t}`);
    }
  }

  interpolate(s) {
    return s.replace(/\{([^}]+)\}/g, (_, exprText) => {
      try {
        const exprLexer = new WebLangLexer(exprText.trim());
        const exprTokens = exprLexer.tokenize();
        const exprParser = new WebLangParser(exprTokens);
        const ast = exprParser.expression();
        const val = this.eval(ast);
        return val === null || val === undefined ? '' : String(val);
      } catch(e) {
        console.warn('WebLang interpolation error:', e.message);
        return '';
      }
    });
  }

  resolveVar(name) {
    for (let i = this.envStack.length - 1; i >= 0; i--) {
      const frame = this.envStack[i];
      if (name in frame.$vars) return frame.$vars[name];
      if (name in frame.$functions) return frame.$functions[name];
    }
    if (name in this.global.$vars) return this.global.$vars[name];
    if (name in this.global.$functions) return this.global.$functions[name];
    this.error(`Undefined variable: ${name}`);
  }

  setVar(name, val) {
    if (this._rerunning) {
      for (let i = this.envStack.length - 1; i >= 0; i--) {
        if (name in this.envStack[i].$vars) return;
      }
    }
    for (let i = this.envStack.length - 1; i >= 0; i--) {
      if (name in this.envStack[i].$vars) { this.envStack[i].$vars[name] = val; return; }
    }
    this.env.$vars[name] = val;
  }

  evalBinary(ast) {
    const l = this.eval(ast.left), r = this.eval(ast.right);
    switch (ast.op) {
      case '+': return Array.isArray(l) ? (Array.isArray(r) ? [...l, ...r] : [...l, r]) : l + r;
      case '-': return l - r;
      case '*': return l * r;
      case '/': return l / r;
      case '==': return l == r;
      case '!=': return l != r;
      case '<': return l < r;
      case '>': return l > r;
      case '<=': return l <= r;
      case '>=': return l >= r;
      case '&&': return l && r;
      case '||': return l || r;
      default: this.error(`Unknown operator: ${ast.op}`);
    }
  }

  evalUnary(ast) {
    const r = this.eval(ast.right);
    switch (ast.op) { case '!': return !r; case '-': return -r; default: this.error(`Unknown unary: ${ast.op}`); }
  }

  evalCall(ast) {
    const callee = ast.callee.t === 'Ident' ? ast.callee.v : this.eval(ast.callee);
    const args = ast.args.map(a => this.eval(a));
    if (typeof callee === 'function') return callee(...args);
    if (callee === 'alert') { alert(args[0]); return null; }
    if (callee === 'rand') { const [min=0,max=1] = args; return Math.floor(Math.random() * (max-min)) + min; }
    if (callee === 'len') { const v = args[0]; return Array.isArray(v) ? v.length : String(v||'').length; }
    if (callee === 'parseNum') { return parseFloat(args[0]) || 0; }
    if (callee === 'str') { return String(args[0]||''); }
    const fn = this.resolveVar(callee);
    if (typeof fn === 'function') return fn(...args);
    this.error(`Unknown function: ${callee}`);
  }

  evalAssign(ast) {
    const val = this.eval(ast.val);
    let result = val;
    if (ast.op !== '=') {
      let current;
      try { current = this.resolveVar(ast.name); } catch(e) { current = 0; }
      if (ast.op === '+=') result = current + val;
      else if (ast.op === '-=') result = current - val;
      else if (ast.op === '*=') result = current * val;
      else if (ast.op === '/=') result = current / val;
    }
    this.setVar(ast.name, result);
    return result;
  }

  evalSet(ast) {
    const obj = this.eval(ast.obj);
    const val = this.eval(ast.val);
    if (obj && typeof obj === 'object') {
      if (obj._ctx) {
        const ctx = obj._ctx;
        switch (ast.prop) {
          case 'fillStyle': ctx.fillStyle = String(val); return val;
          case 'strokeStyle': ctx.strokeStyle = String(val); return val;
          case 'lineWidth': ctx.lineWidth = Number(val); return val;
          case 'font': ctx.font = String(val); return val;
          case 'fillRect': if (Array.isArray(val)) ctx.fillRect(...val); return val;
          case 'strokeRect': if (Array.isArray(val)) ctx.strokeRect(...val); return val;
          case 'fillCircle': if (Array.isArray(val)) { ctx.beginPath(); ctx.arc(val[0], val[1], val[2], 0, Math.PI*2); ctx.fill(); } return val;
          case 'strokeCircle': if (Array.isArray(val)) { ctx.beginPath(); ctx.arc(val[0], val[1], val[2], 0, Math.PI*2); ctx.stroke(); } return val;
          case 'clearRect': if (Array.isArray(val)) ctx.clearRect(...val); return val;
          case 'clear': ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); return val;
          case 'fillText': if (Array.isArray(val)) ctx.fillText(String(val[0]), val[1], val[2]); return val;
          case 'beginPath': ctx.beginPath(); return val;
          case 'moveTo': if (Array.isArray(val)) ctx.moveTo(val[0], val[1]); return val;
          case 'lineTo': if (Array.isArray(val)) ctx.lineTo(val[0], val[1]); return val;
          case 'stroke': ctx.stroke(); return val;
          case 'fill': ctx.fill(); return val;
          case 'line': if (Array.isArray(val)) { ctx.beginPath(); ctx.moveTo(val[0], val[1]); ctx.lineTo(val[2], val[3]); ctx.stroke(); } return val;
          default: break;
        }
      }
      obj.setAttribute ? obj.setAttribute(ast.prop, String(val)) : (obj[ast.prop] = val);
      if (obj._app && obj._app.update) obj._app.update();
    }
    return val;
  }

  evalIf(ast) {
    const cond = this.eval(ast.cond);
    if (cond) return this.eval(ast.thenBody);
    else if (ast.elseBody) return this.eval(ast.elseBody);
    return null;
  }

  evalFor(ast) {
    const iterable = this.eval(ast.iterable);
    let last = null;
    if (iterable && typeof iterable === 'object' && iterable.length !== undefined) {
      for (let i = 0; i < iterable.length; i++) {
        this.envStack.push({ $vars: { [ast.varName]: iterable[i] }, $functions: {}, $appName: this.env.$appName });
        last = this.eval(ast.body);
        this.envStack.pop();
      }
    } else if (typeof iterable === 'number') {
      for (let i = 0; i < iterable; i++) {
        this.envStack.push({ $vars: { [ast.varName]: i }, $functions: {}, $appName: this.env.$appName });
        last = this.eval(ast.body);
        this.envStack.pop();
      }
    }
    return last;
  }

  evalFunction(ast) {
    const fn = (...args) => {
      const frame = { $vars: {}, $functions: {}, $appName: this.env.$appName };
      for (let i = 0; i < ast.params.length; i++) frame.$vars[ast.params[i]] = i < args.length ? args[i] : null;
      this.envStack.push(frame);
      let result = null;
      for (let stmt of ast.body) {
        const r = this.eval(stmt);
        if (r && r.t === 'ReturnVal') { result = r.val; break; }
      }
      this.envStack.pop();
      return result;
    };
    this.setVar(ast.name, fn);
    return fn;
  }

  createElement(ast) {
    const container = this.outputEl;
    let el;
    switch (ast.type) {
      case 'Text': el = document.createElement('div'); el.className = 'wl-text'; break;
      case 'Button': el = document.createElement('button'); el.className = 'wl-button'; break;
      case 'Input': el = document.createElement('input'); el.className = 'wl-input'; el.type = 'text'; break;
      case 'Textarea': el = document.createElement('textarea'); el.className = 'wl-textarea'; break;
      case 'Image': el = document.createElement('img'); el.className = 'wl-image'; break;
      case 'Container': el = document.createElement('div'); el.className = 'wl-container'; break;
      case 'Link': el = document.createElement('a'); el.className = 'wl-link'; break;
      case 'List': el = document.createElement('ul'); el.className = 'wl-list'; break;
      case 'Canvas': el = document.createElement('canvas'); el.className = 'wl-canvas'; break;
      default: el = document.createElement('div');
    }
    if (ast.text) {
      if (ast.type === 'Image') {
        el.src = String(this.eval(ast.text) ?? '');
      } else if (ast.type !== 'Canvas') {
        const raw = ast.text.t === 'Str' ? ast.text.v : String(this.eval(ast.text) ?? '');
        const display = this.interpolate(raw);
        el.textContent = display;
        if (display !== raw) el._wlTemplate = raw;
      }
    }
    for (let p of ast.props) {
      if (p.key === 'placeholder') el.placeholder = String(this.eval(p.val) ?? '');
      else if (p.key === 'src') el.src = String(this.eval(p.val) ?? '');
      else if (p.key === 'width') { const w = this.eval(p.val); el.width = w; el.style.width = w + 'px'; }
      else if (p.key === 'height') { const h = this.eval(p.val); el.height = h; el.style.height = h + 'px'; }
      else if (p.key === 'id') el.id = String(this.eval(p.val) ?? '');
      else if (p.key === 'wl-id') el.setAttribute('data-wl-id', String(this.eval(p.val) ?? ''));
      else el.setAttribute(p.key, String(this.eval(p.val) ?? ''));
    }
    if (ast.type === 'Canvas' && ast.body) {
      const ctx = el.getContext('2d');
      el._ctx = ctx;
      const stmts = Array.isArray(ast.body) ? ast.body : [ast.body];
      const handlers = { onDown: null, onMove: null, onUp: null };
      const regularStmts = [];
      for (let stmt of stmts) {
        if (stmt.t === 'EventHandler' && stmt.eventType in handlers) {
          handlers[stmt.eventType] = stmt.body;
        } else {
          regularStmts.push(stmt);
        }
      }
      el._mouseDown = false;
      el.addEventListener('mousedown', () => { el._mouseDown = true; });
      el.addEventListener('mouseup', () => { el._mouseDown = false; });
      el.addEventListener('mouseleave', () => { el._mouseDown = false; });
      const attachHandler = (type, body) => {
        if (!body) return;
        const evtMap = { onDown: 'mousedown', onMove: 'mousemove', onUp: 'mouseup' };
        el.addEventListener(evtMap[type], (e) => {
          if (type === 'onMove' && !el._mouseDown) return;
          const rect = el.getBoundingClientRect();
          const mx = e.clientX - rect.left, my = e.clientY - rect.top;
          const saved = this.outputEl;
          this.outputEl = container;
          this.envStack.push({ $vars: { mouseX: mx, mouseY: my }, $functions: {}, $appName: this.env.$appName });
          try {
            this.eval(body);
          } finally {
            this.envStack.pop();
            this.outputEl = saved;
          }
        });
      };
      attachHandler('onDown', handlers.onDown);
      attachHandler('onMove', handlers.onMove);
      attachHandler('onUp', handlers.onUp);
      if (regularStmts.length > 0) {
        const saved = this.outputEl;
        this.outputEl = container;
        try {
          this.eval(regularStmts);
        } finally {
          this.outputEl = saved;
        }
      }
    } else if (ast.body && ast.body.length > 0) {
      el._app = { update: () => {} };
      const savedOutput = this.outputEl;
      this.outputEl = el;
      this.eval(ast.body);
      this.outputEl = savedOutput;
    }
    if (ast.type === 'Button' && ast.body) {
      el.addEventListener('click', () => {
        const saved = this.outputEl;
        this.outputEl = container;
        try {
          this.eval(ast.body);
        } finally {
          this.outputEl = saved;
        }
      });
    }
    if (ast.type === 'Input') {
      el.addEventListener('input', () => {
        const name = ast.text ? (ast.text.t === 'Ident' ? ast.text.v : String(this.eval(ast.text))) : null;
        if (name) {
          let val = el.value;
          try {
            if (typeof this.resolveVar(name) === 'number') val = parseFloat(val) || 0;
          } catch(e) {}
          this.setVar(name, val);
        }
      });
    }
    if (ast.type === 'Link' && ast.body) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const saved = this.outputEl;
        this.outputEl = container;
        try {
          this.eval(ast.body);
        } finally {
          this.outputEl = saved;
        }
      });
      el.href = '#';
    }
    if (container) container.appendChild(el);
    return el;
  }

  evalUpdate(ast) {
    if (ast.target) {
      if (ast.target.t === 'Ident') {
        const name = ast.target.v;
        const container = this.outputEl;
        const el = container.querySelector(`[data-wl-id="${name}"]`);
        if (el) {
          this._updateElementText(el);
        }
      } else {
        const target = this.eval(ast.target);
        if (target && target._app) target._app.update();
      }
    } else {
      this.rerun();
    }
  }

  rerun() {
    if (!this._programStmts || this._rerunning) return;
    this._rerunning = true;
    while (this.outputEl && this.outputEl.firstChild) {
      this.outputEl.removeChild(this.outputEl.firstChild);
    }
    const savedEnv = this.envStack;
    this.eval(this._programStmts);
    this._rerunning = false;
  }

  _updateElementText(el) {
    try {
      const template = el._wlTemplate;
      if (!template) return;
      const newTxt = this.interpolate(template);
      if (newTxt !== el.textContent) el.textContent = newTxt;
    } catch(e) {}
  }

  evalApp(ast) {
    const name = String(this.eval(ast.name) ?? 'Untitled');
    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'weblang-app';
    const savedOutput = this.outputEl;
    this.outputEl = bodyContainer;
    this.envStack.push({ $vars: {}, $functions: {}, $appName: name });
    this.eval(ast.body);
    this.envStack.pop();
    this.outputEl = savedOutput;
    if (this.outputEl) this.outputEl.appendChild(bodyContainer);
    return { name, element: bodyContainer };
  }
}

class WebLangRuntime {
  constructor() { this.apps = {}; }
  run(code, outputEl) {
    const lexer = new WebLangLexer(code);
    const tokens = lexer.tokenize();
    const parser = new WebLangParser(tokens);
    const ast = parser.parse();
    const interp = new WebLangInterpreter(outputEl);
    interp._programStmts = ast.stmts;
    interp.eval(ast);
    return interp;
  }
  runApp(code, outputEl) {
    const result = this.run(code, outputEl);
    return result;
  }
  listApps() { return Object.keys(this.apps); }
}

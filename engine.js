(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const IMG_EXT = ['webp', 'jpg', 'png'];
  const SAVE_KEY = 'officeRomance.saves.v1';
  const META_KEY = 'officeRomance.meta.v1';
  const ENDINGS = {
    seoyun: '한서윤 엔딩 「빨간 펜의 마지막 줄」',
    harin: '윤하린 엔딩 「우리의 첫 번째 시안」',
    yuna: '정유나 엔딩 「크레딧 뒤의 한 줄」',
    normal: '노멀 엔딩 「다음 주에도 출근합니다」',
  };

  // ---------- 저장소 (실패해도 게임은 계속) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  };

  // ---------- 스크립트 파서 ----------
  function parse(src) {
    const labels = {};
    let cur = null;
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//')) continue;
      if (line.startsWith('#')) { cur = line.slice(1).trim(); labels[cur] = []; continue; }
      if (!cur) continue;
      const list = labels[cur];
      if (line.startsWith('? ')) {
        const m = line.slice(1).match(/^(.*?)->\s*(\S+)\s*(?:\|(.*))?$/);
        if (!m) throw new Error('선택지 문법 오류: ' + line);
        const effects = (m[3] || '').trim().split(/\s+/).filter(Boolean).map(parseEffect);
        const opt = { text: m[1].trim(), target: m[2], effects };
        const last = list[list.length - 1];
        if (last && last.type === 'choice') last.options.push(opt);
        else list.push({ type: 'choice', options: [opt] });
        continue;
      }
      if (line.startsWith('@')) {
        const [cmd, ...args] = line.slice(1).split(/\s+/);
        list.push({ type: cmd, args, raw: line.slice(cmd.length + 2) });
        continue;
      }
      const sm = line.match(/^([^:\s]{1,6}):\s(.*)$/);
      if (sm) list.push({ type: 'say', who: sm[1], text: sm[2] });
      else list.push({ type: 'say', who: '', text: line });
    }
    return labels;
  }
  function parseEffect(s) {
    const m = s.match(/^(\w+)([+-])(\d+)$/);
    if (!m) throw new Error('효과 문법 오류: ' + s);
    return { id: m[1], v: (m[2] === '-' ? -1 : 1) * Number(m[3]) };
  }

  const SCRIPT = parse(window.STORY);
  window.__SCRIPT = SCRIPT; // 테스트용

  // ---------- 플레이스홀더 이미지 ----------
  function placeholderChar(id, expr) {
    const c = window.CHARS[id];
    const faces = {
      normal: { eye: 'M-14 0h9M5 0h9', mouth: 'M-6 22h12' },
      smile: { eye: 'M-14 2q4.5-5 9 0M5 2q4.5-5 9 0', mouth: 'M-8 19q8 8 16 0' },
      shy: { eye: 'M-14 2q4.5-4 9 0M5 2q4.5-4 9 0', mouth: 'M-5 21q5 4 10 0', blush: true },
      sad: { eye: 'M-14 2l9-3M5 -1l9 3', mouth: 'M-7 24q7-6 14 0' },
      surprise: { eye: 'M-10 0a2.5 3 0 1 0 .1 0M10 0a2.5 3 0 1 0 .1 0', mouth: 'M0 18a4 5 0 1 0 .1 0' },
      angry: { eye: 'M-14 -3l9 3M5 0l9-3', mouth: 'M-7 22h14' },
    };
    const f = faces[expr] || faces.normal;
    const hair = {
      short: `<path d="M-62 -10q0-70 62-72q62 2 62 72q-6 50-8 58l-8-60q-46-6-92 0l-8 60q-2-8-8-58z" fill="${c.hair}"/>`,
      bob_long: `<path d="M-66 -6q0-78 66-78q66 0 66 78l6 120q-30 12-42-6l-4-118q-26-10-52 0l-4 118q-12 18-42 6z" fill="${c.hair}"/>`,
      long: `<path d="M-64 -8q0-76 64-76q64 0 64 76l10 210q-30 12-50-4l-6-212q-18-8-36 0l-6 212q-20 16-50 4z" fill="${c.hair}"/>`,
    }[c.hairStyle];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-150 -150 300 460">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.color}"/><stop offset="1" stop-color="${c.color}" stop-opacity=".75"/></linearGradient></defs>
${hair}
<path d="M-110 310q8-150 110-162q102 12 110 162z" fill="url(#g)"/>
<path d="M-22 120h44v34q-22 14-44 0z" fill="#e9c9b2"/>
<ellipse cx="0" cy="20" rx="54" ry="68" fill="#f1d6c2"/>
<path d="M-56 0q4-70 56-72q52 2 56 72q-30-34-56-36q-26 2-56 36z" fill="${c.hair}"/>
<g transform="translate(0,22)" fill="none" stroke="#3a2a24" stroke-width="3.2" stroke-linecap="round">
<path d="${f.eye}"/><path d="${f.mouth}"/></g>
${f.blush ? '<ellipse cx="-30" cy="44" rx="11" ry="5" fill="#e8907e" opacity=".55"/><ellipse cx="30" cy="44" rx="11" ry="5" fill="#e8907e" opacity=".55"/>' : ''}
<rect x="-90" y="262" width="180" height="30" rx="15" fill="rgba(0,0,0,.45)"/>
<text x="0" y="282" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#fff">${c.full} · ${expr}</text>
</svg>`;
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }

  // 실제 이미지 파일이 있으면 그것을, 없으면 플레이스홀더를 쓴다.
  const resolved = new Map();
  function probe(paths) {
    return new Promise((res) => {
      const tryAt = (i) => {
        if (i >= paths.length) return res(null);
        const im = new Image();
        im.onload = () => res(paths[i]);
        im.onerror = () => tryAt(i + 1);
        im.src = paths[i];
      };
      tryAt(0);
    });
  }
  function resolveImage(key, paths, fallback, apply) {
    if (resolved.has(key)) { apply(resolved.get(key)); return; }
    apply(fallback);
    probe(paths).then((p) => {
      const val = p ? `url("${p}")` : fallback;
      resolved.set(key, val);
      apply(val);
    });
  }
  const variants = (dir, base) => IMG_EXT.map((e) => `images/${dir}/${base}.${e}`);

  // ---------- 상태 ----------
  const fresh = () => ({
    name: '이도현', label: 'start', idx: 0,
    aff: { seoyun: 0, harin: 0, yuna: 0 },
    bg: null, chars: { left: null, center: null, right: null }, log: [],
  });
  let S = fresh();
  let meta = store.get(META_KEY, { endings: [], read: {} });
  let waiting = null; // 'text' | 'choice' | 'end' | null
  let typing = null;
  let auto = false, skip = false;
  let timer = null;

  // ---------- 렌더 ----------
  function renderBg() {
    const b = window.BGS[S.bg];
    const el = $('#bg');
    if (!b) { el.style.background = '#111'; $('#bg-label').textContent = ''; return; }
    const grad = `linear-gradient(160deg, ${b[0]}, ${b[1]})`;
    $('#bg-label').textContent = b[2];
    resolveImage('bg:' + S.bg, variants('bg', S.bg), grad, (v) => {
      if (window.BGS[S.bg] !== b) return;
      el.style.background = v + ' center / cover no-repeat';
      $('#bg-label').style.display = v === grad ? '' : 'none';
    });
  }
  function renderChars(activeId) {
    document.querySelectorAll('.char').forEach((el) => {
      const slot = S.chars[el.dataset.pos];
      if (!slot) { el.classList.remove('on'); el.dataset.id = ''; return; }
      const [id, expr] = slot;
      el.classList.add('on');
      el.classList.toggle('dim', !!activeId && activeId !== id);
      el.dataset.id = id;
      const ph = placeholderChar(id, expr);
      resolveImage(`c:${id}:${expr}`, [...variants('char', `${id}_${expr}`), ...variants('char', `${id}_normal`)], ph, (v) => {
        const now = S.chars[el.dataset.pos];
        if (now && now[0] === id && now[1] === expr) el.style.backgroundImage = v;
      });
    });
  }
  const fill = (t) => t.replaceAll('{name}', S.name);

  // ---------- 실행 루프 ----------
  function step() {
    clearTimeout(timer);
    while (true) {
      const list = SCRIPT[S.label];
      if (!list) { console.error('라벨 없음', S.label); return; }
      const c = list[S.idx];
      if (!c) { console.error('라벨 끝에 도달(점프 누락)', S.label); return; }
      S.idx++;
      switch (c.type) {
        case 'bg': S.bg = c.args[0]; renderBg(); break;
        case 'show': {
          const [id, expr = 'normal', pos] = c.args;
          let p = pos || Object.keys(S.chars).find((k) => S.chars[k] && S.chars[k][0] === id) || 'center';
          for (const k in S.chars) if (k !== p && S.chars[k] && S.chars[k][0] === id) S.chars[k] = null;
          S.chars[p] = [id, expr];
          renderChars();
          break;
        }
        case 'hide': for (const k in S.chars) if (S.chars[k] && S.chars[k][0] === c.args[0]) S.chars[k] = null; renderChars(); break;
        case 'hideall': S.chars = { left: null, center: null, right: null }; renderChars(); break;
        case 'set': { const e = parseEffect(c.args[0]); S.aff[e.id] += e.v; break; }
        case 'jump': S.label = c.args[0]; S.idx = 0; break;
        case 'day': return showDay(c.raw);
        case 'route': {
          const order = ['seoyun', 'harin', 'yuna'];
          let best = null;
          for (const id of order) if (S.aff[id] >= window.ROUTE_THRESHOLD && (!best || S.aff[id] > S.aff[best])) best = id;
          S.label = best ? 'route_' + best : 'route_none'; S.idx = 0; break;
        }
        case 'choice': return showChoice(c.options);
        case 'end': return showEnding(c.args[0]);
        case 'say': return say(c);
        default: console.warn('알 수 없는 명령', c);
      }
    }
  }

  function showDay(text) {
    const dc = $('#daycard');
    dc.firstElementChild.textContent = text;
    dc.classList.add('show');
    waiting = 'day';
    setTimeout(() => { dc.classList.remove('show'); waiting = null; step(); }, skip ? 300 : 1700);
  }

  function say(c) {
    const who = c.who === '나' ? S.name : c.who;
    const text = fill(c.text);
    const id = window.SPEAKERS[c.who];
    renderChars(id || (c.who ? '__none' : null));
    $('#speaker').textContent = who;
    const tEl = $('#text');
    tEl.classList.toggle('narr', !c.who);
    $('#textbox').hidden = false;
    $('#textbox').classList.remove('done');
    S.log.push([who, text]); if (S.log.length > 200) S.log.shift();
    const readKey = S.label + ':' + S.idx;
    const wasRead = !!meta.read[readKey];
    meta.read[readKey] = 1;
    waiting = 'text';
    if (skip) {
      if (!wasRead && skip === 'read') { setSkip(false); }
      else { tEl.textContent = text; finishText(); timer = setTimeout(advance, 45); return; }
    }
    let i = 0;
    tEl.textContent = '';
    clearInterval(typing);
    typing = setInterval(() => {
      i += 1;
      tEl.textContent = text.slice(0, i);
      if (i >= text.length) finishText();
    }, 28);
  }
  function finishText() {
    clearInterval(typing); typing = null;
    $('#textbox').classList.add('done');
    if (auto && !skip) timer = setTimeout(advance, 1400 + S.log[S.log.length - 1][1].length * 35);
  }
  function advance() {
    if (waiting !== 'text') return;
    if (typing) { clearInterval(typing); typing = null; $('#text').textContent = S.log[S.log.length - 1][1]; finishText(); return; }
    waiting = null;
    step();
  }

  function showChoice(options) {
    setSkip(false);
    waiting = 'choice';
    const box = $('#choices');
    box.innerHTML = '';
    options.forEach((o) => {
      const b = document.createElement('button');
      b.textContent = fill(o.text);
      b.onclick = (ev) => {
        ev.stopPropagation();
        o.effects.forEach((e) => { S.aff[e.id] += e.v; });
        S.log.push(['▶', fill(o.text)]);
        box.hidden = true;
        S.label = o.target; S.idx = 0; waiting = null;
        step();
      };
      box.appendChild(b);
    });
    box.hidden = false;
    box.querySelector('button').focus({ preventScroll: true });
  }

  function showEnding(id) {
    setSkip(false); setAuto(false);
    waiting = 'end';
    if (!meta.endings.includes(id)) meta.endings.push(id);
    store.set(META_KEY, meta);
    $('#ending-title').textContent = ENDINGS[id] || id;
    $('#ending-count').textContent = `수집한 엔딩 ${meta.endings.length} / ${Object.keys(ENDINGS).length}`;
    $('#ending').hidden = false;
  }

  // ---------- 저장/불러오기 ----------
  const snapshot = () => JSON.parse(JSON.stringify({ ...S, idx: Math.max(0, S.idx - 1) }));
  function restoreAt(state) {
    S = { ...fresh(), ...JSON.parse(JSON.stringify(state)) };
    hideScreens();
    $('#hud').hidden = false; $('#choices').hidden = true;
    renderBg(); renderChars();
    waiting = null; step();
  }
  function saveSlot(n) {
    const saves = store.get(SAVE_KEY, {});
    const b = window.BGS[S.bg];
    saves[n] = { state: snapshot(), at: new Date().toLocaleString('ko-KR'), where: b ? b[2] : '', line: (S.log[S.log.length - 1] || ['', ''])[1].slice(0, 40) };
    if (!store.set(SAVE_KEY, saves)) alert('이 브라우저에서는 저장할 수 없어요.');
  }
  function slotsHtml(mode) {
    const saves = store.get(SAVE_KEY, {});
    return [1, 2, 3, 4, 5].map((n) => {
      const s = saves[n];
      const info = s ? `<div>슬롯 ${n} · ${s.where}<small>${s.at}</small><small>${escapeHtml(s.line)}…</small></div>` : `<div>슬롯 ${n}<small>비어 있음</small></div>`;
      const dis = mode === 'load' && !s ? 'disabled' : '';
      return `<div class="slot">${info}<button data-slot="${n}" data-mode="${mode}" ${dis}>${mode === 'save' ? '저장' : '불러오기'}</button></div>`;
    }).join('');
  }
  const escapeHtml = (t) => t.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  // ---------- 모달 ----------
  function modal(title, html) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = html;
    $('#modal').hidden = false;
    setAuto(false); setSkip(false);
  }
  function profilesHtml(showBars) {
    return Object.entries(window.CHARS).map(([id, c]) => {
      const bar = showBars ? `<div class="bar"><i style="width:${Math.max(0, Math.min(100, S.aff[id] / 20 * 100))}%;background:${c.color}"></i></div>` : '';
      return `<div class="profile"><div class="thumb" data-thumb="${id}"></div><div><b>${c.full}</b> (${c.age})<br><small>${c.role}</small>${bar}</div></div>`;
    }).join('');
  }
  function fillThumbs() {
    document.querySelectorAll('[data-thumb]').forEach((el) => {
      const id = el.dataset.thumb;
      resolveImage(`c:${id}:normal`, variants('char', `${id}_normal`), placeholderChar(id, 'normal'), (v) => { el.style.backgroundImage = v; });
    });
  }

  function hideScreens() { ['#title', '#namebox', '#modal', '#ending'].forEach((s) => { $(s).hidden = true; }); }
  function toTitle() {
    clearTimeout(timer); clearInterval(typing);
    setAuto(false); setSkip(false);
    store.set(META_KEY, meta);
    hideScreens();
    $('#title').hidden = false; $('#hud').hidden = true; $('#textbox').hidden = true; $('#choices').hidden = true;
    const saves = store.get(SAVE_KEY, {});
    $('#title [data-act="continue"]').disabled = !Object.keys(saves).length;
  }
  function setAuto(v) { auto = v; $('#hud [data-act="auto"]').classList.toggle('on', v); if (v && waiting === 'text' && !typing) timer = setTimeout(advance, 800); }
  function setSkip(v) { skip = v; $('#hud [data-act="skip"]').classList.toggle('on', !!v); if (v && waiting === 'text') advance(); }

  // ---------- 입력 ----------
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (btn && btn.dataset.slot) {
      const n = btn.dataset.slot;
      if (btn.dataset.mode === 'save') { saveSlot(n); $('#modal-body').innerHTML = slotsHtml('save'); }
      else { const s = store.get(SAVE_KEY, {})[n]; if (s) restoreAt(s.state); }
      return;
    }
    const act = btn && btn.dataset.act;
    switch (act) {
      case 'new': $('#namebox').hidden = false; $('#name-input').focus(); return;
      case 'cancel': $('#namebox').hidden = true; return;
      case 'start': {
        const nm = $('#name-input').value.trim() || '이도현';
        S = fresh(); S.name = nm;
        hideScreens(); $('#hud').hidden = false; step(); return;
      }
      case 'continue': modal('불러오기', slotsHtml('load')); return;
      case 'endings': modal('엔딩 목록', Object.entries(ENDINGS).map(([id, t]) => {
        const got = meta.endings.includes(id);
        return `<div class="end-item ${got ? '' : 'locked'}">${got ? '★ ' + t : '☆ ???'}</div>`;
      }).join('') + `<p>수집 ${meta.endings.length} / ${Object.keys(ENDINGS).length}</p>`); return;
      case 'about': modal('등장인물', profilesHtml(false)); fillThumbs(); return;
      case 'close': $('#modal').hidden = true; return;
      case 'auto': setAuto(!auto); return;
      case 'skip': setSkip(skip ? false : 'read'); return;
      case 'log': modal('대사 로그', S.log.slice(-80).map(([w, t]) => `<div class="log-line">${w ? `<b>${escapeHtml(w)}</b>` : ''}${escapeHtml(t)}</div>`).join('') || '<p>아직 없음</p>');
        requestAnimationFrame(() => { const b = $('#modal-body').parentElement; b.scrollTop = b.scrollHeight; }); return;
      case 'save': modal('저장', slotsHtml('save')); return;
      case 'load': modal('불러오기', slotsHtml('load')); return;
      case 'status': modal('호감도', profilesHtml(true) + `<p><small>호감도 ${window.ROUTE_THRESHOLD} 이상인 사람 중 가장 높은 사람과 일요일을 보내게 됩니다.</small></p>`); fillThumbs(); return;
      case 'title': if (confirm('타이틀로 돌아갈까요? 저장하지 않은 진행은 사라집니다.')) toTitle(); return;
      case 'totitle': toTitle(); return;
    }
    if (ev.target.closest('#textbox') || (ev.target.closest('#stage') && !btn && !ev.target.closest('.screen'))) advance();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.target.tagName === 'INPUT') { if (ev.key === 'Enter') $('#namebox [data-act="start"]').click(); return; }
    if (ev.key === ' ' || ev.key === 'Enter') { if (waiting === 'text') { ev.preventDefault(); advance(); } }
    if (ev.key === 'Escape' && !$('#modal').hidden) $('#modal').hidden = true;
    if (ev.key === 'Control' && waiting === 'text') setSkip('all');
  });
  document.addEventListener('keyup', (ev) => { if (ev.key === 'Control' && skip === 'all') setSkip(false); });
  window.addEventListener('beforeunload', () => store.set(META_KEY, meta));

  toTitle();
})();

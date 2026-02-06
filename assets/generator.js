(() => {
  const encoder = new TextEncoder();

  const pageFiles = [
    { id: 'index', label: 'index.json' },
    { id: 'info', label: 'info.json' },
    { id: 'sponsors', label: 'sponsors.json' },
    { id: 'terms', label: 'terms.json' },
    { id: 'thankyou', label: 'thankyou.json' },
    { id: '404', label: '404.json' },
    { id: 'test', label: 'test.json' }
  ];

  const buildPath = (id, lang) => {
    if (id === 'site') return 'data/site.json';
    return `data/${lang}/${id}.json`;
  };

  const staticFiles = [
    { path: 'index.html', source: 'home.html' },
    { path: '404.html', source: '404.html' },
    { path: 'info.html', source: 'info.html' },
    { path: 'sponsors.html', source: 'sponsors.html' },
    { path: 'terms.html', source: 'terms.html' },
    { path: 'test.html', source: 'test.html' },
    { path: 'thankyou.html', source: 'thankyou.html' },
    { path: 'vercel.json', source: 'vercel.json' },
    { path: 'README.md', source: 'README.md' },
    { path: 'assets/styles.css', source: 'assets/styles.css' },
    { path: 'assets/script.js', source: 'assets/script.js' },
    { path: 'assets/img/placeholder.svg', source: 'assets/img/placeholder.svg' }
  ];

  const PREVIEW_KEY = 'rc-cup-preview';

  const state = {
    currentId: 'site',
    currentLang: 'nl',
    data: new Map(),
    originals: new Map(),
    uploaded: []
  };

  const qs = sel => document.querySelector(sel);
  const fileSelectEl = qs('#file-select');
  const langSelectEl = qs('#lang-select');
  const currentFileEl = qs('#current-file');
  const statusEl = qs('#json-status');
  const assetListEl = qs('#asset-list');
  const zipStatusEl = qs('#zip-status');
  const formContainerEl = qs('#form-container');
  const previewBtnEl = qs('#open-preview');

  const setStatus = (msg, isError) => {
    statusEl.textContent = msg || '';
    statusEl.style.color = isError ? '#d62828' : 'var(--muted)';
  };

  const setZipStatus = (msg, isError) => {
    zipStatusEl.textContent = msg || '';
    zipStatusEl.style.color = isError ? '#d62828' : 'var(--muted)';
  };

  let saveTimer = null;
  const saveDraft = () => {
    const payload = { updatedAt: Date.now(), files: {} };
    state.data.forEach((value, path) => {
      payload.files[path] = value;
    });
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
  };

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 200);
  };

  const initSelectors = () => {
    fileSelectEl.innerHTML = '';
    const siteOpt = document.createElement('option');
    siteOpt.value = 'site';
    siteOpt.textContent = 'site.json';
    fileSelectEl.appendChild(siteOpt);
    pageFiles.forEach(file => {
      const opt = document.createElement('option');
      opt.value = file.id;
      opt.textContent = file.label;
      fileSelectEl.appendChild(opt);
    });
  };

  const getCurrentPath = () => buildPath(state.currentId, state.currentLang);

  const setCurrentFileDisplay = () => {
    currentFileEl.textContent = getCurrentPath();
  };

  const deepClone = value => JSON.parse(JSON.stringify(value));

  const loadFiles = async () => {
    const paths = [];
    paths.push(buildPath('site'));
    pageFiles.forEach(file => {
      ['nl', 'en'].forEach(lang => paths.push(buildPath(file.id, lang)));
    });
    const responses = await Promise.all(paths.map(path => fetch(path, { cache: 'no-store' })));
    responses.forEach((res, idx) => {
      if (!res.ok) throw new Error(`Kan ${paths[idx]} niet laden`);
    });
    const texts = await Promise.all(responses.map(res => res.text()));
    paths.forEach((path, idx) => {
      const obj = JSON.parse(texts[idx]);
      state.data.set(path, obj);
      state.originals.set(path, deepClone(obj));
    });
  };

  const resetCurrent = () => {
    const path = getCurrentPath();
    const original = state.originals.get(path);
    if (!original) return;
    state.data.set(path, deepClone(original));
    renderForm();
    scheduleSave();
    setStatus('Teruggezet naar template');
  };

  const reloadAll = async () => {
    await loadFiles();
    renderForm();
    scheduleSave();
    setStatus('Alles opnieuw geladen');
  };

  const addUploadedFiles = files => {
    Array.from(files).forEach(file => {
      state.uploaded.push(file);
    });
    renderAssets();
  };

  const removeUploaded = idx => {
    state.uploaded.splice(idx, 1);
    renderAssets();
  };

  const renderAssets = () => {
    assetListEl.innerHTML = '';
    if (state.uploaded.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = 'Geen extra uploads.';
      assetListEl.appendChild(empty);
      return;
    }
    state.uploaded.forEach((file, idx) => {
      const row = document.createElement('div');
      row.className = 'card gen-array-item';
      const name = document.createElement('div');
      name.textContent = file.name;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.textContent = 'Verwijder';
      btn.addEventListener('click', () => removeUploaded(idx));
      row.appendChild(name);
      row.appendChild(btn);
      assetListEl.appendChild(row);
    });
  };

  const encodeFileName = name => encoder.encode(name.replace(/\\/g, '/'));

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  const crc32 = data => {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const toDosDateTime = date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const mins = date.getMinutes();
    const secs = Math.floor(date.getSeconds() / 2);
    const dosTime = (hours << 11) | (mins << 5) | secs;
    const dosDate = ((year - 1980) << 9) | (month << 5) | day;
    return { dosTime, dosDate };
  };

  const concatArrays = arrays => {
    const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    arrays.forEach(arr => {
      out.set(arr, offset);
      offset += arr.length;
    });
    return out;
  };

  const buildZip = files => {
    const date = new Date();
    const { dosTime, dosDate } = toDosDateTime(date);
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach(file => {
      const nameBytes = encodeFileName(file.path);
      const data = file.data;
      const crc = crc32(data);

      const localHeader = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(localHeader.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, dosTime, true);
      dv.setUint16(12, dosDate, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true);
      dv.setUint32(22, data.length, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      localHeader.set(nameBytes, 30);

      localParts.push(localHeader, data);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(centralHeader.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, dosTime, true);
      cv.setUint16(14, dosDate, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      centralHeader.set(nameBytes, 46);
      centralParts.push(centralHeader);

      offset += localHeader.length + data.length;
    });

    const centralDir = concatArrays(centralParts);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralDir.length, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    const localData = concatArrays(localParts);
    return concatArrays([localData, centralDir, end]);
  };

  const collectZipFiles = async () => {
    const files = [];

    state.data.forEach((value, path) => {
      const text = JSON.stringify(value, null, 2);
      files.push({ path, data: encoder.encode(text) });
    });

    const staticResponses = await Promise.all(
      staticFiles.map(item => fetch(item.source, { cache: 'no-store' }))
    );
    staticResponses.forEach((res, idx) => {
      if (!res.ok) throw new Error(`Kan ${staticFiles[idx].source} niet laden`);
    });
    const staticBuffers = await Promise.all(staticResponses.map(res => res.arrayBuffer()));
    staticFiles.forEach((item, idx) => {
      files.push({ path: item.path, data: new Uint8Array(staticBuffers[idx]) });
    });

    for (const file of state.uploaded) {
      const buffer = await file.arrayBuffer();
      files.push({ path: `assets/uploads/${file.name}`, data: new Uint8Array(buffer) });
    }

    return files;
  };

  const downloadZip = async () => {
    setZipStatus('Bezig met verzamelen...');
    try {
      const files = await collectZipFiles();
      setZipStatus('ZIP wordt gebouwd...');
      const zipBytes = buildZip(files);
      const blob = new Blob([zipBytes], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'rc-cup-site.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setZipStatus(`Klaar. ${files.length} bestanden toegevoegd.`);
    } catch (err) {
      setZipStatus(err.message, true);
    }
  };

  const normalizeLabel = label => label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, m => m.toUpperCase());

  const getValueAtPath = (obj, path) => {
    let ref = obj;
    for (const key of path) {
      if (ref == null) return undefined;
      ref = ref[key];
    }
    return ref;
  };

  const setValueAtPath = (obj, path, value) => {
    let ref = obj;
    for (let i = 0; i < path.length - 1; i++) {
      ref = ref[path[i]];
    }
    ref[path[path.length - 1]] = value;
  };

  const makeEmptyLike = value => {
    if (Array.isArray(value)) return [];
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).forEach(key => {
        out[key] = makeEmptyLike(value[key]);
      });
      return out;
    }
    if (typeof value === 'number') return 0;
    if (typeof value === 'boolean') return false;
    return '';
  };

  const updateValue = (path, value) => {
    const data = getCurrentView();
    setValueAtPath(data, path, value);
    scheduleSave();
  };

  const createField = (label, value, path) => {
    const field = document.createElement('label');
    field.className = 'form-field';
    const span = document.createElement('span');
    span.textContent = normalizeLabel(label);
    field.appendChild(span);
    let input;
    if (typeof value === 'boolean') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = value;
      input.addEventListener('change', () => updateValue(path, input.checked));
    } else if (typeof value === 'number') {
      input = document.createElement('input');
      input.type = 'number';
      input.value = value;
      input.addEventListener('input', () => {
        const num = Number(input.value);
        updateValue(path, Number.isNaN(num) ? 0 : num);
      });
    } else {
      const lower = String(label).toLowerCase();
      const useTextarea = lower.includes('text')
        || lower.includes('lead')
        || lower.includes('description')
        || lower.includes('note')
        || lower.includes('title');
      if (useTextarea) {
        input = document.createElement('textarea');
        input.value = value || '';
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
      }
      input.addEventListener('input', () => updateValue(path, input.value));
    }
    field.appendChild(input);
    return field;
  };

  const renderNode = (container, value, path, label) => {
    if (Array.isArray(value)) {
      const block = document.createElement('div');
      block.className = 'gen-group';
      const header = document.createElement('div');
      header.className = 'gen-array-header';
      const title = document.createElement('div');
      title.className = 'kicker';
      title.textContent = normalizeLabel(label || 'Items');
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn';
      addBtn.textContent = 'Toevoegen';
      addBtn.addEventListener('click', () => {
        const data = getCurrentView();
        const arr = getValueAtPath(data, path);
        const template = arr.length ? makeEmptyLike(arr[0]) : '';
        arr.push(template);
        renderForm();
        scheduleSave();
      });
      header.appendChild(title);
      header.appendChild(addBtn);
      block.appendChild(header);

      const list = document.createElement('div');
      list.className = 'gen-array';
      value.forEach((item, index) => {
        const itemWrap = document.createElement('div');
        itemWrap.className = 'card gen-array-item';
        const removeRow = document.createElement('div');
        removeRow.className = 'gen-inline';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn';
        removeBtn.textContent = 'Verwijder';
        removeBtn.addEventListener('click', () => {
          const data = getCurrentView();
          const arr = getValueAtPath(data, path);
          arr.splice(index, 1);
          renderForm();
          scheduleSave();
        });
        removeRow.appendChild(removeBtn);
        itemWrap.appendChild(removeRow);
        renderNode(itemWrap, item, [...path, index], `${label || 'Item'} ${index + 1}`);
        list.appendChild(itemWrap);
      });
      block.appendChild(list);
      container.appendChild(block);
      return;
    }

    if (value && typeof value === 'object') {
      const block = document.createElement('div');
      block.className = 'gen-group';
      if (label) {
        const title = document.createElement('div');
        title.className = 'kicker';
        title.textContent = normalizeLabel(label);
        block.appendChild(title);
      }
      Object.keys(value).forEach(key => {
        renderNode(block, value[key], [...path, key], key);
      });
      container.appendChild(block);
      return;
    }

    container.appendChild(createField(label || 'Field', value, path));
  };

  const getCurrentView = () => {
    const path = getCurrentPath();
    const data = state.data.get(path);
    if (!data) return null;
    if (state.currentId !== 'site') return data;
    const lang = state.currentLang;
    return {
      brand: data.brand?.[lang] || {},
      nav: data.nav?.[lang] || {}
    };
  };

  const renderForm = () => {
    const path = getCurrentPath();
    setCurrentFileDisplay();
    const data = getCurrentView();
    if (!data) return;
    formContainerEl.innerHTML = '';
    renderNode(formContainerEl, data, [], null);
    setStatus('');
  };

  const onSelectionChange = () => {
    state.currentId = fileSelectEl.value;
    state.currentLang = langSelectEl.value;
    renderForm();
  };

  const openPreview = () => {
    const lang = langSelectEl.value || state.currentLang || 'nl';
    localStorage.setItem('lang', lang);
    window.open(`home.html?preview=1&lang=${lang}`, '_blank');
  };

  fileSelectEl.addEventListener('change', onSelectionChange);
  langSelectEl.addEventListener('change', onSelectionChange);
  qs('#reset-file').addEventListener('click', resetCurrent);
  qs('#reload-all').addEventListener('click', reloadAll);
  qs('#asset-upload').addEventListener('change', e => addUploadedFiles(e.target.files));
  qs('#generate-zip').addEventListener('click', downloadZip);
  if (previewBtnEl) previewBtnEl.addEventListener('click', openPreview);

  initSelectors();
  loadFiles()
    .then(() => {
      onSelectionChange();
      renderAssets();
      saveDraft();
    })
    .catch(err => setStatus(err.message, true));
})();

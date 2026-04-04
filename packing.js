/* =========================================
   WANDERLUST — PACKING JS
   Editable, shareable, persistent packing lists
   ========================================= */

const PACKING_STORAGE_KEY = 'wanderlust_packingLists';
const PACKING_ACTIVE_KEY = 'wanderlust_packingActiveList';

const packingTemplates = {
  essentials: ['Passport/ID', 'Travel insurance documents', 'Phone & charger', 'Wallet & cards', 'Prescription medications', 'Sunglasses', 'Reusable water bottle', 'Travel adapter'],
  beach: ['Swimsuit', 'Beach towel', 'Sunscreen (SPF 50+)', 'Flip-flops', 'Snorkel gear', 'Beach bag', 'Hat/cap', 'After-sun lotion'],
  temple: ['Modest clothing', 'Scarf/shawl', 'Comfortable walking shoes', 'Camera', 'Small backpack', 'Guidebook'],
  city: ['Comfortable walking shoes', 'Day backpack', 'City map/offline maps', 'Transit card', 'Casual outfits', 'Evening outfit', 'Umbrella'],
  adventure: ['Hiking boots', 'Weather-appropriate layers', 'First aid kit', 'Headlamp/flashlight', 'Multi-tool', 'Energy bars', 'Trekking poles', 'Waterproof jacket'],
  cold: ['Warm coat', 'Thermal layers', 'Gloves', 'Scarf', 'Warm hat', 'Thermal socks', 'Hand warmers', 'Lip balm'],
  hot: ['Light clothing', 'Sunscreen', 'Hat', 'Insect repellent', 'Electrolyte packets', 'Cooling towel', 'Sandals'],
  rainy: ['Raincoat/poncho', 'Waterproof shoes', 'Compact umbrella', 'Waterproof bag cover', 'Quick-dry clothing', 'Extra socks']
};

let currentPackingList = null;
let draggedItem = null;

/* ---- Storage ---- */

function loadPackingLists() {
  try {
    return JSON.parse(localStorage.getItem(PACKING_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function savePackingLists(lists) {
  localStorage.setItem(PACKING_STORAGE_KEY, JSON.stringify(lists));
}

function getActiveListId() {
  return localStorage.getItem(PACKING_ACTIVE_KEY) || '';
}

function setActiveListId(id) {
  if (id) {
    localStorage.setItem(PACKING_ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(PACKING_ACTIVE_KEY);
  }
}

function generateListId() {
  return 'list_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

/* ---- List Generation ---- */

function generatePackingList() {
  const destName = document.getElementById('packingDestination')?.value || '';
  const days = parseInt(document.getElementById('packingDays')?.value) || 7;
  const style = document.getElementById('packingStyle')?.value || 'general';

  const all = typeof flattenDestinations === 'function' && typeof travelData !== 'undefined'
    ? flattenDestinations(travelData) : [];
  const dest = all.find(d => d.name === destName);
  const weather = dest && typeof getMockWeather === 'function'
    ? getMockWeather(dest.timezone) : { condition: 'sunny', temp: 25 };
  const type = dest ? (dest.type || '').toLowerCase() : '';

  const categories = {
    'Essentials': [...packingTemplates.essentials],
    'Clothing': []
  };

  if (type.includes('beach')) categories['Clothing'].push(...packingTemplates.beach);
  else if (type.includes('temple')) categories['Clothing'].push(...packingTemplates.temple);
  else categories['Clothing'].push(...packingTemplates.city);

  if (style === 'adventure') categories['Clothing'].push(...packingTemplates.adventure);
  if (weather.condition === 'rainy' || weather.condition === 'stormy') categories['Clothing'].push(...packingTemplates.rainy);
  if (weather.temp < 10) categories['Clothing'].push(...packingTemplates.cold);
  else if (weather.temp > 30) categories['Clothing'].push(...packingTemplates.hot);

  categories['Clothing'] = [...new Set(categories['Clothing'])];
  categories['Electronics'] = ['Phone charger', 'Power bank', 'Camera', 'Headphones', 'Travel adapter'];
  categories['Documents'] = ['Passport', 'Visa (if required)', 'Travel insurance', 'Flight tickets', 'Hotel reservations', 'Emergency contacts'];
  categories['Health'] = ['Prescription medications', 'Pain relievers', 'Band-aids', 'Hand sanitizer', 'Insect repellent', 'Sunscreen'];

  if (destName && typeof getLegalRequirementsForDestination === 'function') {
    const legal = getLegalRequirementsForDestination(destName);
    if (legal) {
      const legalItems = [];
      if (legal.visa) legalItems.push(`VISA: ${legal.visa}`);
      if (legal.passport) legalItems.push(`PASSPORT: ${legal.passport}`);
      if (legal.health) legalItems.push(`HEALTH: ${legal.health}`);
      if (legal.customs) legalItems.push(`CUSTOMS: ${legal.customs}`);
      if (legal.driving) legalItems.push(`DRIVING: ${legal.driving}`);
      if (legal.insurance) legalItems.push(`INSURANCE: ${legal.insurance}`);
      if (legal.currency) legalItems.push(`CURRENCY: ${legal.currency}`);
      if (legal.electronics) legalItems.push(`ELECTRONICS: ${legal.electronics}`);
      if (legal.medications) legalItems.push(`MEDICATIONS: ${legal.medications}`);
      if (legal.additional) {
        legal.additional.forEach(a => legalItems.push(`NOTE: ${a}`));
      }
      categories[`Legal — ${legal.country}`] = legalItems;
    }
  }

  const listName = destName
    ? `${destName} — ${style.charAt(0).toUpperCase() + style.slice(1)} (${days}d)`
    : `Packing List — ${style.charAt(0).toUpperCase() + style.slice(1)} (${days}d)`;

  const list = {
    id: generateListId(),
    name: listName,
    destination: destName,
    days: days,
    style: style,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categories: Object.entries(categories).map(([name, items]) => ({
      name,
      collapsed: false,
      items: items.map(text => ({ text, checked: false }))
    }))
  };

  currentPackingList = list;
  const lists = loadPackingLists();
  lists[list.id] = list;
  savePackingLists(lists);
  setActiveListId(list.id);

  renderPackingList();
  updateListManager();
  showToast('Packing list generated!', 'success');
}

/* ---- Rendering ---- */

function renderPackingList() {
  const container = document.getElementById('packingListContainer');
  if (!container) return;

  if (!currentPackingList || !currentPackingList.categories.length) {
    container.innerHTML = `
      <div class="packing-empty">
        <span class="packing-empty-icon">🧳</span>
        <h3>No packing list yet</h3>
        <p>Fill in your trip details above and click Generate to create a weather-aware packing list.</p>
      </div>
    `;
    return;
  }

  const list = currentPackingList;
  let totalItems = 0;
  let checkedItems = 0;

  const categoriesHtml = list.categories.map((cat, catIdx) => {
    const catChecked = cat.items.filter(i => i.checked).length;
    totalItems += cat.items.length;
    checkedItems += catChecked;

    const isLegal = cat.name.startsWith('Legal —');
    const legalBadge = isLegal ? '<span class="packing-legal-badge">&#x2696; Legal</span>' : '';

    const itemsHtml = cat.items.map((item, itemIdx) => {
      let displayText = escapeHtml(item.text);
      if (isLegal) {
        displayText = displayText.replace(/^(VISA|PASSPORT|HEALTH|CUSTOMS|DRIVING|INSURANCE|CURRENCY|ELECTRONICS|MEDICATIONS|NOTE): /, '<strong>$1:</strong> ');
      }
      return `
        <div class="packing-item"
             draggable="true"
             data-cat="${catIdx}"
             data-item="${itemIdx}"
             ondragstart="onDragStart(event)"
             ondragover="onDragOver(event)"
             ondragenter="onDragEnter(event)"
             ondragleave="onDragLeave(event)"
             ondrop="onDrop(event)"
             ondragend="onDragEnd(event)">
          <span class="packing-item-drag" aria-hidden="true" title="Drag to reorder">&#x2630;</span>
          <input type="checkbox"
                 id="pack_${catIdx}_${itemIdx}"
                 ${item.checked ? 'checked' : ''}
                 onchange="togglePackingItem(${catIdx}, ${itemIdx})"
                 aria-label="${escapeHtml(item.text)}" />
          <label for="pack_${catIdx}_${itemIdx}">${displayText}</label>
          <button class="packing-item-delete"
                  onclick="deletePackingItem(${catIdx}, ${itemIdx})"
                  title="Remove item"
                  aria-label="Remove ${escapeHtml(item.text)}">
            &#x2715;
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="packing-category ${cat.collapsed ? 'collapsed' : ''}" data-cat="${catIdx}" ${isLegal ? 'data-legal="true"' : ''}>
        <button class="packing-category-header"
                onclick="togglePackingCategory(${catIdx})"
                aria-expanded="${!cat.collapsed}"
                aria-controls="packing-items-${catIdx}">
          <span class="packing-category-title">
            <span class="packing-category-chevron">&#x25BC;</span>
            ${escapeHtml(cat.name)}${legalBadge}
          </span>
          <span class="packing-category-count">${catChecked}/${cat.items.length}</span>
        </button>
        <div class="packing-items" id="packing-items-${catIdx}" role="list">
          ${itemsHtml}
          <div class="packing-add-item">
            <input type="text"
                   id="addInput_${catIdx}"
                   placeholder="Add item..."
                   onkeydown="if(event.key==='Enter')addPackingItem(${catIdx})"
                   aria-label="Add new item to ${escapeHtml(cat.name)}" />
            <button class="packing-add-item-btn" onclick="addPackingItem(${catIdx})">Add</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const pct = totalItems > 0 ? Math.round(checkedItems / totalItems * 100) : 0;

  container.innerHTML = `
    <div class="packing-progress" role="status" aria-live="polite">
      <div class="packing-progress-text">${checkedItems} of ${totalItems} items packed (${pct}%)</div>
      <div class="packing-progress-bar">
        <div class="packing-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>
    <div class="packing-toolbar">
      <button class="packing-toolbar-btn" onclick="openShareModal()" aria-label="Share or export list">
        <span>&#x2197;</span> Share / Export
      </button>
      <button class="packing-toolbar-btn" onclick="checkAllItems()" aria-label="Check all items">
        Check All
      </button>
      <button class="packing-toolbar-btn" onclick="uncheckAllItems()" aria-label="Uncheck all items">
        Uncheck All
      </button>
      <span class="packing-toolbar-spacer"></span>
      <button class="packing-toolbar-btn danger" onclick="resetPackingList()" aria-label="Reset to defaults">
        Reset
      </button>
    </div>
    <div class="packing-list" role="list">
      ${categoriesHtml}
      <div class="packing-add-category">
        <button class="packing-add-category-btn" onclick="addPackingCategory()">+ Add Category</button>
      </div>
    </div>
  `;
}

/* ---- Item Operations ---- */

function togglePackingItem(catIdx, itemIdx) {
  if (!currentPackingList) return;
  const cat = currentPackingList.categories[catIdx];
  if (!cat || !cat.items[itemIdx]) return;
  cat.items[itemIdx].checked = !cat.items[itemIdx].checked;
  saveCurrentList();
  renderPackingList();
}

function deletePackingItem(catIdx, itemIdx) {
  if (!currentPackingList) return;
  const cat = currentPackingList.categories[catIdx];
  if (!cat) return;
  cat.items.splice(itemIdx, 1);
  if (cat.items.length === 0) {
    currentPackingList.categories.splice(catIdx, 1);
  }
  saveCurrentList();
  renderPackingList();
}

function addPackingItem(catIdx) {
  if (!currentPackingList) return;
  const input = document.getElementById(`addInput_${catIdx}`);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  currentPackingList.categories[catIdx].items.push({ text, checked: false });
  input.value = '';
  saveCurrentList();
  renderPackingList();
  setTimeout(() => {
    const newInput = document.getElementById(`addInput_${catIdx}`);
    if (newInput) newInput.focus();
  }, 50);
}

function addPackingCategory() {
  if (!currentPackingList) return;
  const name = prompt('Category name:');
  if (!name || !name.trim()) return;
  currentPackingList.categories.push({
    name: name.trim(),
    collapsed: false,
    items: []
  });
  saveCurrentList();
  renderPackingList();
}

function togglePackingCategory(catIdx) {
  if (!currentPackingList) return;
  const cat = currentPackingList.categories[catIdx];
  if (!cat) return;
  cat.collapsed = !cat.collapsed;
  saveCurrentList();
  renderPackingList();
}

function checkAllItems() {
  if (!currentPackingList) return;
  currentPackingList.categories.forEach(cat => {
    cat.items.forEach(item => { item.checked = true; });
  });
  saveCurrentList();
  renderPackingList();
}

function uncheckAllItems() {
  if (!currentPackingList) return;
  currentPackingList.categories.forEach(cat => {
    cat.items.forEach(item => { item.checked = false; });
  });
  saveCurrentList();
  renderPackingList();
}

function resetPackingList() {
  if (!currentPackingList) return;
  if (!confirm('Reset this list to its original generated items? Custom additions will be lost.')) return;
  const destName = currentPackingList.destination || '';
  const days = currentPackingList.days || 7;
  const style = currentPackingList.style || 'general';

  const all = typeof flattenDestinations === 'function' && typeof travelData !== 'undefined'
    ? flattenDestinations(travelData) : [];
  const dest = all.find(d => d.name === destName);
  const weather = dest && typeof getMockWeather === 'function'
    ? getMockWeather(dest.timezone) : { condition: 'sunny', temp: 25 };
  const type = dest ? (dest.type || '').toLowerCase() : '';

  const categories = {
    'Essentials': [...packingTemplates.essentials],
    'Clothing': []
  };
  if (type.includes('beach')) categories['Clothing'].push(...packingTemplates.beach);
  else if (type.includes('temple')) categories['Clothing'].push(...packingTemplates.temple);
  else categories['Clothing'].push(...packingTemplates.city);
  if (style === 'adventure') categories['Clothing'].push(...packingTemplates.adventure);
  if (weather.condition === 'rainy' || weather.condition === 'stormy') categories['Clothing'].push(...packingTemplates.rainy);
  if (weather.temp < 10) categories['Clothing'].push(...packingTemplates.cold);
  else if (weather.temp > 30) categories['Clothing'].push(...packingTemplates.hot);
  categories['Clothing'] = [...new Set(categories['Clothing'])];
  categories['Electronics'] = ['Phone charger', 'Power bank', 'Camera', 'Headphones', 'Travel adapter'];
  categories['Documents'] = ['Passport', 'Visa (if required)', 'Travel insurance', 'Flight tickets', 'Hotel reservations', 'Emergency contacts'];
  categories['Health'] = ['Prescription medications', 'Pain relievers', 'Band-aids', 'Hand sanitizer', 'Insect repellent', 'Sunscreen'];

  if (destName && typeof getLegalRequirementsForDestination === 'function') {
    const legal = getLegalRequirementsForDestination(destName);
    if (legal) {
      const legalItems = [];
      if (legal.visa) legalItems.push(`VISA: ${legal.visa}`);
      if (legal.passport) legalItems.push(`PASSPORT: ${legal.passport}`);
      if (legal.health) legalItems.push(`HEALTH: ${legal.health}`);
      if (legal.customs) legalItems.push(`CUSTOMS: ${legal.customs}`);
      if (legal.driving) legalItems.push(`DRIVING: ${legal.driving}`);
      if (legal.insurance) legalItems.push(`INSURANCE: ${legal.insurance}`);
      if (legal.currency) legalItems.push(`CURRENCY: ${legal.currency}`);
      if (legal.electronics) legalItems.push(`ELECTRONICS: ${legal.electronics}`);
      if (legal.medications) legalItems.push(`MEDICATIONS: ${legal.medications}`);
      if (legal.additional) {
        legal.additional.forEach(a => legalItems.push(`NOTE: ${a}`));
      }
      categories[`Legal — ${legal.country}`] = legalItems;
    }
  }

  currentPackingList.categories = Object.entries(categories).map(([name, items]) => ({
    name,
    collapsed: false,
    items: items.map(text => ({ text, checked: false }))
  }));
  currentPackingList.updatedAt = new Date().toISOString();
  saveCurrentList();
  renderPackingList();
  showToast('List reset to defaults', 'info');
}

/* ---- Drag & Drop ---- */

function onDragStart(e) {
  draggedItem = {
    cat: parseInt(e.currentTarget.dataset.cat),
    item: parseInt(e.currentTarget.dataset.item)
  };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function onDragEnter(e) {
  e.preventDefault();
  const item = e.currentTarget.closest('.packing-item');
  if (item && item !== e.target.closest('.dragging')) {
    document.querySelectorAll('.packing-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    item.classList.add('drag-over');
  }
}

function onDragLeave(e) {
  e.currentTarget.closest('.packing-item')?.classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  const target = e.currentTarget.closest('.packing-item');
  if (!target || !draggedItem) return;
  const targetCat = parseInt(target.dataset.cat);
  const targetItem = parseInt(target.dataset.item);

  if (draggedItem.cat === targetCat && draggedItem.item === targetItem) return;

  const list = currentPackingList;
  const sourceCat = list.categories[draggedItem.cat];
  const [movedItem] = sourceCat.items.splice(draggedItem.item, 1);

  if (draggedItem.cat === targetCat) {
    const adjustedIdx = draggedItem.item < targetItem ? targetItem - 1 : targetItem;
    sourceCat.items.splice(adjustedIdx, 0, movedItem);
  } else {
    list.categories[targetCat].items.splice(targetItem, 0, movedItem);
    if (sourceCat.items.length === 0) {
      list.categories.splice(draggedItem.cat, 1);
    }
  }

  saveCurrentList();
  renderPackingList();
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.packing-item.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedItem = null;
}

/* ---- List Management ---- */

function updateListManager() {
  const container = document.getElementById('packingListManager');
  if (!container) return;

  const lists = loadPackingLists();
  const activeId = getActiveListId();
  const entries = Object.values(lists).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (entries.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  container.innerHTML = `
    <label for="packingSavedLists">Saved Lists</label>
    <select id="packingSavedLists" onchange="loadPackingListById(this.value)">
      <option value="">— Select a saved list —</option>
      ${entries.map(l => `
        <option value="${l.id}" ${l.id === activeId ? 'selected' : ''}>
          ${escapeHtml(l.name)} (${new Date(l.updatedAt).toLocaleDateString()})
        </option>
      `).join('')}
    </select>
    <button class="packing-save-btn" onclick="saveCurrentListAs()" title="Save current list">Save</button>
    <button class="packing-delete-btn" onclick="deleteActiveList()" title="Delete active list">Delete</button>
    <button class="packing-new-btn" onclick="clearPackingView()" title="Start fresh">New</button>
  `;
}

function loadPackingListById(id) {
  if (!id) return;
  const lists = loadPackingLists();
  if (lists[id]) {
    currentPackingList = lists[id];
    setActiveListId(id);
    renderPackingList();
    updateListManager();
  }
}

function saveCurrentList() {
  if (!currentPackingList) return;
  currentPackingList.updatedAt = new Date().toISOString();
  const lists = loadPackingLists();
  lists[currentPackingList.id] = currentPackingList;
  savePackingLists(lists);
  updateListManager();
}

function saveCurrentListAs() {
  if (!currentPackingList) {
    showToast('Generate a list first', 'warning');
    return;
  }
  const name = prompt('List name:', currentPackingList.name);
  if (!name || !name.trim()) return;
  const newList = JSON.parse(JSON.stringify(currentPackingList));
  newList.id = generateListId();
  newList.name = name.trim();
  newList.updatedAt = new Date().toISOString();
  const lists = loadPackingLists();
  lists[newList.id] = newList;
  savePackingLists(lists);
  currentPackingList = newList;
  setActiveListId(newList.id);
  renderPackingList();
  updateListManager();
  showToast('List saved!', 'success');
}

function deleteActiveList() {
  const activeId = getActiveListId();
  if (!activeId) {
    showToast('No list selected', 'warning');
    return;
  }
  if (!confirm('Delete this saved list?')) return;
  const lists = loadPackingLists();
  delete lists[activeId];
  savePackingLists(lists);
  setActiveListId('');
  currentPackingList = null;
  renderPackingList();
  updateListManager();
  showToast('List deleted', 'info');
}

function clearPackingView() {
  currentPackingList = null;
  setActiveListId('');
  renderPackingList();
  updateListManager();
}

/* ---- Share & Export ---- */

function openShareModal() {
  if (!currentPackingList) return;
  const modal = document.getElementById('packingShareModal');
  if (modal) modal.classList.add('open');
}

function closeShareModal() {
  const modal = document.getElementById('packingShareModal');
  if (modal) modal.classList.remove('open');
}

function buildShareText() {
  if (!currentPackingList) return '';
  let text = `🧳 ${currentPackingList.name}\n`;
  text += `Generated: ${new Date(currentPackingList.updatedAt).toLocaleDateString()}\n`;
  text += `${'─'.repeat(32)}\n\n`;

  currentPackingList.categories.forEach(cat => {
    text += `▸ ${cat.name}\n`;
    cat.items.forEach(item => {
      text += `  ${item.checked ? '☑' : '☐'} ${item.text}\n`;
    });
    text += '\n';
  });

  const total = getTotalItemCount();
  const checked = getCheckedItemCount();
  text += `${checked}/${total} items packed`;
  return text;
}

function getTotalItemCount() {
  if (!currentPackingList) return 0;
  return currentPackingList.categories.reduce((sum, cat) => sum + cat.items.length, 0);
}

function getCheckedItemCount() {
  if (!currentPackingList) return 0;
  return currentPackingList.categories.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
}

async function shareViaWeb() {
  const text = buildShareText();
  if (navigator.share) {
    try {
      await navigator.share({
        title: currentPackingList.name,
        text: text
      });
      showToast('Shared successfully!', 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        fallbackCopyToClipboard(text);
      }
    }
  } else {
    fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      legacyCopyToClipboard(text);
    });
  } else {
    legacyCopyToClipboard(text);
  }
}

function legacyCopyToClipboard(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Copied to clipboard!', 'success');
  } catch {
    showToast('Failed to copy. Please select and copy manually.', 'error');
  }
  document.body.removeChild(ta);
}

function exportAsCSV() {
  if (!currentPackingList) return;
  let csv = 'Category,Item,Packed\n';
  currentPackingList.categories.forEach(cat => {
    cat.items.forEach(item => {
      csv += `"${cat.name}","${item.text}","${item.checked ? 'Yes' : 'No'}"\n`;
    });
  });
  downloadFile(csv, `${currentPackingList.name.replace(/[^a-z0-9]/gi, '_')}.csv`, 'text/csv');
  showToast('CSV exported!', 'success');
}

function exportAsJSON() {
  if (!currentPackingList) return;
  const json = JSON.stringify(currentPackingList, null, 2);
  downloadFile(json, `${currentPackingList.name.replace(/[^a-z0-9]/gi, '_')}.json`, 'application/json');
  showToast('JSON exported!', 'success');
}

function exportAsText() {
  const text = buildShareText();
  downloadFile(text, `${currentPackingList.name.replace(/[^a-z0-9]/gi, '_')}.txt`, 'text/plain');
  showToast('Text file exported!', 'success');
}

function exportAsICS() {
  if (!currentPackingList) return;
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Wanderlust//Packing List//EN\n';
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  currentPackingList.categories.forEach((cat, ci) => {
    cat.items.forEach((item, ii) => {
      if (!item.checked) {
        ics += 'BEGIN:VTODO\n';
        ics += `UID:packing-${currentPackingList.id}-${ci}-${ii}@wanderlust\n`;
        ics += `DTSTAMP:${now}\n`;
        ics += `SUMMARY:${item.text} (${cat.name})\n`;
        ics += `STATUS:NEEDS-ACTION\n`;
        ics += 'END:VTODO\n';
      }
    });
  });

  ics += 'END:VCALENDAR';
  downloadFile(ics, `${currentPackingList.name.replace(/[^a-z0-9]/gi, '_')}.ics`, 'text/calendar');
  showToast('Calendar file exported! Import into Reminders or Google Tasks.', 'success');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printPackingList() {
  window.print();
}

/* ---- Toast Helper ---- */

function showToast(message, type) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.log(`[${type}] ${message}`);
    return;
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${type || 'info'}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast--removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ---- Escape HTML ---- */

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ---- Populate Destination Dropdown ---- */

function populatePackingDestinations() {
  const select = document.getElementById('packingDestination');
  if (!select) return;
  if (typeof travelData === 'undefined') return;

  const all = typeof flattenDestinations === 'function' ? flattenDestinations(travelData) : [];
  const seen = new Set();

  all.forEach(d => {
    if (seen.has(d.name)) return;
    seen.add(d.name);
    const opt = document.createElement('option');
    opt.value = d.name;
    opt.textContent = d.name;
    select.appendChild(opt);
  });
}

/* ---- Init ---- */

function initPackingPage() {
  populatePackingDestinations();
  updateListManager();

  const activeId = getActiveListId();
  if (activeId) {
    const lists = loadPackingLists();
    if (lists[activeId]) {
      currentPackingList = lists[activeId];
    }
  }

  renderPackingList();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShareModal();
    }
  });

  const modal = document.getElementById('packingShareModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeShareModal();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPackingPage);
} else {
  initPackingPage();
}

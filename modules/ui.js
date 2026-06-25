export function createCustomDropdown(options, className, defaultOption) {
  const container = document.createElement("div");
  container.className = `custom-dropdown ${className}`;
  const initialValue = defaultOption || options[0];
  container.setAttribute("data-value", initialValue);

  const selected = document.createElement("div");
  selected.className = "dropdown-selected";
  
  const textSpan = document.createElement("span");
  textSpan.className = "dropdown-text";
  textSpan.textContent = initialValue;
  selected.appendChild(textSpan);
  
  const icon = document.createElement("span");
  icon.className = "dropdown-icon";
  icon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
  selected.appendChild(icon);

  const items = document.createElement("div");
  items.className = "dropdown-items dropdown-hide";

  options.forEach(opt => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = opt;
    item.dataset.value = opt;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      textSpan.textContent = opt;
      container.setAttribute("data-value", opt);
      container.value = opt; // update property
      container.dispatchEvent(new Event("change"));
      items.classList.add("dropdown-hide");
    });
    items.appendChild(item);
  });

  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown-items").forEach(el => {
      if (el !== items) el.classList.add("dropdown-hide");
    });
    items.classList.toggle("dropdown-hide");
  });

  document.addEventListener("click", () => {
    items.classList.add("dropdown-hide");
  });

  container.appendChild(selected);
  container.appendChild(items);

  // Expose a standard value property
  Object.defineProperty(container, "value", {
    get: () => container.getAttribute("data-value"),
    set: (val) => {
      container.setAttribute("data-value", val);
      textSpan.textContent = val;
    }
  });
  
  container.value = initialValue;

  return container;
}

const iconCache = new Map();

export async function getIconSvg(name) {
  if (iconCache.has(name)) {
    return iconCache.get(name);
  }
  try {
    const url = chrome.runtime.getURL(`icons/${name}.svg`);
    const response = await fetch(url);
    const svgText = await response.text();
    iconCache.set(name, svgText);
    return svgText;
  } catch (error) {
    console.error(`Failed to load SVG icon: ${name}`, error);
    return "";
  }
}

export function createScrollTimePicker(initialValue) {
  const ITEM_HEIGHT = 40;

  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';

  // Parse initial value
  let currentHour = 9;
  let currentMinute = 0;
  if (initialValue) {
    const parts = initialValue.split(':');
    currentHour = parseInt(parts[0], 10) || 0;
    currentMinute = parseInt(parts[1], 10) || 0;
  }

  // Trigger button
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'time-picker-trigger';
  trigger.innerHTML = `
    <span class="time-picker-trigger-text">${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  `;

  // Popover
  const popover = document.createElement('div');
  popover.className = 'time-picker-popover';

  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'time-picker-columns';

  // Build a column
  function buildColumn(count, selectedValue, onChange) {
    const colWrapper = document.createElement('div');
    colWrapper.style.position = 'relative';

    const col = document.createElement('div');
    col.className = 'time-picker-col';

    // Top padding
    const padTop = document.createElement('div');
    padTop.className = 'time-picker-col-pad';
    col.appendChild(padTop);

    const items = [];
    for (let i = 0; i < count; i++) {
      const item = document.createElement('div');
      item.className = 'time-picker-item';
      item.textContent = String(i).padStart(2, '0');
      item.dataset.value = i;
      if (i === selectedValue) item.classList.add('selected');
      item.addEventListener('click', () => {
        col.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
      });
      items.push(item);
      col.appendChild(item);
    }

    // Bottom padding
    const padBottom = document.createElement('div');
    padBottom.className = 'time-picker-col-pad';
    col.appendChild(padBottom);

    // Highlight band
    const highlight = document.createElement('div');
    highlight.className = 'time-picker-highlight';

    // Fade overlays
    const fadeTop = document.createElement('div');
    fadeTop.className = 'time-picker-fade-top';
    const fadeBottom = document.createElement('div');
    fadeBottom.className = 'time-picker-fade-bottom';

    colWrapper.appendChild(col);
    colWrapper.appendChild(highlight);
    colWrapper.appendChild(fadeTop);
    colWrapper.appendChild(fadeBottom);

    // Scroll handler with debounce
    let scrollTimeout = null;
    col.addEventListener('scroll', () => {
      const idx = Math.round(col.scrollTop / ITEM_HEIGHT);
      items.forEach((it, i) => {
        it.classList.toggle('selected', i === idx);
      });
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const snappedIdx = Math.round(col.scrollTop / ITEM_HEIGHT);
        onChange(snappedIdx);
      }, 80);
    });

    // Initial scroll
    requestAnimationFrame(() => {
      col.scrollTop = selectedValue * ITEM_HEIGHT;
    });

    return { colWrapper, col, items, scrollTo: (val) => {
      col.scrollTo({ top: val * ITEM_HEIGHT, behavior: 'smooth' });
    }};
  }

  const hourCol = buildColumn(24, currentHour, (val) => {
    currentHour = val;
    updateDisplay();
  });

  const minuteCol = buildColumn(60, currentMinute, (val) => {
    currentMinute = val;
    updateDisplay();
  });

  const separator = document.createElement('div');
  separator.className = 'time-picker-separator';
  separator.textContent = ':';

  columnsContainer.appendChild(hourCol.colWrapper);
  columnsContainer.appendChild(separator);
  columnsContainer.appendChild(minuteCol.colWrapper);
  popover.appendChild(columnsContainer);

  wrapper.appendChild(trigger);
  wrapper.appendChild(popover);

  function updateDisplay() {
    const textEl = trigger.querySelector('.time-picker-trigger-text');
    if (textEl) {
      textEl.textContent = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    }
    wrapper.dispatchEvent(new Event('change'));
  }

  // Toggle popover
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = popover.classList.contains('open');
    closeAllTimePickers();
    if (!isOpen) {
      popover.classList.add('open');
      trigger.classList.add('open');
      // Re-scroll to current values
      hourCol.scrollTo(currentHour);
      minuteCol.scrollTo(currentMinute);
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      popover.classList.remove('open');
      trigger.classList.remove('open');
    }
  });

  // Expose value property
  Object.defineProperty(wrapper, 'value', {
    get: () => `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`,
    set: (val) => {
      if (!val) return;
      const parts = val.split(':');
      currentHour = parseInt(parts[0], 10) || 0;
      currentMinute = parseInt(parts[1], 10) || 0;
      updateDisplay();
      hourCol.scrollTo(currentHour);
      minuteCol.scrollTo(currentMinute);
    }
  });

  return wrapper;
}

function closeAllTimePickers() {
  document.querySelectorAll('.time-picker-popover.open').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.time-picker-trigger.open').forEach(t => t.classList.remove('open'));
}

export function createQuantityOptionsRow(idPrefix) {
  const optionsRow = document.createElement("div");
  optionsRow.className = "qty-options-row";
  optionsRow.style.display = "flex";
  optionsRow.style.alignItems = "center";
  optionsRow.style.gap = "10px";
  optionsRow.style.marginBottom = "15px";

  const trackCheckbox = document.createElement("input");
  trackCheckbox.type = "checkbox";
  trackCheckbox.id = `${idPrefix}-track-qty`;
  trackCheckbox.className = "custom-checkbox";
  
  const trackLabel = document.createElement("label");
  trackLabel.htmlFor = `${idPrefix}-track-qty`;
  trackLabel.textContent = "Track Quantity / Sub-parts";
  trackLabel.style.fontSize = "13px";
  trackLabel.style.color = "var(--text-secondary)";
  trackLabel.style.cursor = "pointer";

  const targetInput = document.createElement("input");
  targetInput.type = "number";
  targetInput.id = `${idPrefix}-target`;
  targetInput.className = "input-field qty-target-input";
  targetInput.placeholder = "Target (e.g. 20)";
  targetInput.style.display = "none";
  targetInput.style.width = "120px";
  targetInput.style.padding = "4px 8px";
  targetInput.min = "1";

  trackCheckbox.addEventListener("change", () => {
    targetInput.style.display = trackCheckbox.checked ? "block" : "none";
  });

  optionsRow.appendChild(trackCheckbox);
  optionsRow.appendChild(trackLabel);
  optionsRow.appendChild(targetInput);

  return { row: optionsRow, checkbox: trackCheckbox, input: targetInput };
}

export function createQuantityPillUI(item, onDecrement, onIncrement, isSmall = false, hideButtons = false) {
  const qtyContainer = document.createElement("div");
  qtyContainer.className = "qty-container";
  qtyContainer.style.display = "flex";
  qtyContainer.style.alignItems = "center";
  qtyContainer.style.gap = isSmall ? "4px" : "6px";
  qtyContainer.style.marginLeft = "auto";
  qtyContainer.style.marginRight = isSmall ? "16px" : "20px";

  const btnSize = isSmall ? "16px" : "20px";
  const fontSize = isSmall ? "12px" : "14px";

  const decBtn = document.createElement("button");
  decBtn.className = "qty-btn";
  decBtn.textContent = "-";
  decBtn.style.width = btnSize;
  decBtn.style.height = btnSize;
  decBtn.style.background = "white";
  decBtn.style.border = "none";
  decBtn.style.borderRadius = "50%";
  decBtn.style.color = "black";
  decBtn.style.cursor = "pointer";
  decBtn.style.display = "flex";
  decBtn.style.alignItems = "center";
  decBtn.style.justifyContent = "center";
  decBtn.style.fontWeight = "bold";
  decBtn.style.fontSize = fontSize;
  decBtn.style.lineHeight = "1";

  const incBtn = document.createElement("button");
  incBtn.className = "qty-btn";
  incBtn.textContent = "+";
  incBtn.style.width = btnSize;
  incBtn.style.height = btnSize;
  incBtn.style.background = "white";
  incBtn.style.border = "none";
  incBtn.style.borderRadius = "50%";
  incBtn.style.color = "black";
  incBtn.style.cursor = "pointer";
  incBtn.style.display = "flex";
  incBtn.style.alignItems = "center";
  incBtn.style.justifyContent = "center";
  incBtn.style.fontWeight = "bold";
  incBtn.style.fontSize = fontSize;
  incBtn.style.lineHeight = "1";

  const pill = document.createElement("span");
  pill.className = "qty-pill";
  pill.textContent = `${item.completedQuantity || 0} / ${item.targetQuantity}`;
  pill.style.fontSize = isSmall ? "10px" : "12px";
  pill.style.background = item.done ? "var(--success)" : "var(--accent)";
  pill.style.color = "var(--accent-inverse)";
  pill.style.padding = isSmall ? "1px 4px" : "2px 6px";
  pill.style.borderRadius = isSmall ? "8px" : "12px";

  decBtn.onclick = onDecrement;
  incBtn.onclick = onIncrement;

  if (!hideButtons) qtyContainer.appendChild(decBtn);
  qtyContainer.appendChild(pill);
  if (!hideButtons) qtyContainer.appendChild(incBtn);

  return qtyContainer;
}

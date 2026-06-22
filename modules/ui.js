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

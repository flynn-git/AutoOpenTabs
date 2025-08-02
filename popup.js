const urlInput = document.getElementById('urlInput');
const addBtn = document.getElementById('addBtn');
const openAllBtn = document.getElementById('openAllBtn');
const urlList = document.getElementById('urlList');
const messageBox = document.getElementById('messageBox');

// Show message
function showMessage(text) {
  if (!messageBox) return;
  messageBox.textContent = text;
  setTimeout(() => {
    messageBox.textContent = '';
  }, 3000);
}

// Render URLs
function renderUrls(urls) {
  urlList.innerHTML = '';
  urls.forEach((entry, index) => {
    const li = document.createElement('li');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = entry.name || entry.url;
    nameInput.className = 'url-text';
    nameInput.title = entry.url;
    nameInput.readOnly = true;
    nameInput.style = `
      flex: 1;
      border: none;
      background: transparent;
      font-size: 12px;
      color: #2563eb;
      cursor: pointer;
    `;

    nameInput.addEventListener('click', () => {
      chrome.tabs.create({ url: entry.url });
    });

    const renameBtn = document.createElement('button');
    renameBtn.textContent = '✎';
    renameBtn.className = 'rename-btn';
    renameBtn.title = 'Edit name';
    renameBtn.style = `
      font-size: 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      margin-left: 4px;
      color: #4a5568;
    `;

    renameBtn.addEventListener('click', () => {
      nameInput.readOnly = false;
      nameInput.focus();
    });

    nameInput.addEventListener('blur', () => {
      nameInput.readOnly = true;
      const newName = nameInput.value.trim();
      if (!newName) return;
      chrome.storage.local.get(['urls'], (result) => {
        const updated = result.urls || [];
        updated[index].name = newName;
        chrome.storage.local.set({ urls: updated }, () => {
          renderUrls(updated);
          showMessage('Name updated');
        });
      });
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-btn';
    removeBtn.title = 'Remove';
    removeBtn.style = `
      font-size: 14px;
      background: transparent;
      border: none;
      cursor: pointer;
      margin-left: 4px;
      color: #ef4444;
    `;

    removeBtn.addEventListener('click', () => {
      removeUrl(index);
    });

    li.appendChild(nameInput);
    li.appendChild(renameBtn);
    li.appendChild(removeBtn);
    urlList.appendChild(li);
  });
}

// Load URLs
function loadUrls() {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    renderUrls(urls);
  });
}

// Remove URL
function removeUrl(indexToRemove) {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    urls.splice(indexToRemove, 1);
    chrome.storage.local.set({ urls }, () => {
      renderUrls(urls);
      showMessage('URL removed');
    });
  });
}

// Add URL
addBtn.addEventListener('click', () => {
  let url = urlInput.value.trim();
  if (!url) {
    showMessage('Please enter a URL');
    return;
  }
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  try {
    new URL(url);
  } catch {
    showMessage('Invalid URL format');
    return;
  }

  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    if (urls.some(entry => entry.url === url)) {
      showMessage('URL already added');
      return;
    }
    urls.push({ name: url, url });
    chrome.storage.local.set({ urls }, () => {
      urlInput.value = '';
      renderUrls(urls);
      showMessage('URL added');
    });
  });
});

// Open all URLs with notification
openAllBtn.addEventListener('click', () => {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    if (urls.length === 0) {
      showMessage('No URLs saved to open.');
      return;
    }
    for (const entry of urls) {
      chrome.tabs.create({ url: entry.url });
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png', // Make sure you have this icon in your extension folder
      title: 'Auto Open Tabs',
      message: `Opened ${urls.length} tab${urls.length > 1 ? 's' : ''} successfully!`,
      priority: 2
    });
  });
});

// Enter = Add URL
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

// Init
loadUrls();

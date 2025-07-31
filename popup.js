const urlInput = document.getElementById('urlInput');
const addBtn = document.getElementById('addBtn');
const openAllBtn = document.getElementById('openAllBtn');
const urlList = document.getElementById('urlList');
const messageBox = document.getElementById('messageBox');

// Show custom message for 3s
function showMessage(text) {
  messageBox.textContent = text;
  setTimeout(() => {
    messageBox.textContent = '';
  }, 3000);
}

function renderUrls(urls) {
  urlList.innerHTML = '';
  urls.forEach((url, index) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = url;
    span.className = 'url-text';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-btn';
    removeBtn.title = 'Remove this URL';
    removeBtn.addEventListener('click', () => {
      removeUrl(index);
    });

    li.appendChild(span);
    li.appendChild(removeBtn);
    urlList.appendChild(li);
  });
}

function loadUrls() {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    renderUrls(urls);
  });
}

function removeUrl(indexToRemove) {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    urls.splice(indexToRemove, 1);
    chrome.storage.local.set({ urls }, () => {
      renderUrls(urls);
    });
  });
}

addBtn.addEventListener('click', () => {
  let url = urlInput.value.trim();
  if (!url) {
    showMessage('Please enter a URL');
    return;
  }
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    if (urls.includes(url)) {
      showMessage('URL already added');
      return;
    }
    urls.push(url);
    chrome.storage.local.set({ urls }, () => {
      urlInput.value = '';
      renderUrls(urls);
    });
  });
});

openAllBtn.addEventListener('click', () => {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    if (urls.length === 0) {
      showMessage('No URLs saved to open.');
      return;
    }
    for (const url of urls) {
      chrome.tabs.create({ url });
    }
  });
});

// Load on popup open
loadUrls();

function openSavedUrls() {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    for (const entry of urls) {
      chrome.tabs.create({ url: entry.url });
    }
  });
}

// When extension icon clicked
chrome.action.onClicked.addListener(() => {
  openSavedUrls();
});

// On install or startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveCurrentTab',
    title: 'Save this tab to AutoOpen',
    contexts: ['page']
  });
});

chrome.runtime.onStartup.addListener(() => {
  openSavedUrls();
});

// Context menu logic
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveCurrentTab' && tab?.url) {
    chrome.storage.local.get(['urls'], (result) => {
      const urls = result.urls || [];
      const exists = urls.some(entry => entry.url === tab.url);
      if (!exists) {
        urls.push({ name: tab.title || tab.url, url: tab.url });
        chrome.storage.local.set({ urls });
      }
    });
  }
});

// Keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    openSavedUrls();
  }
});
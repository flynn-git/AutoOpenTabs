function openSavedUrls() {
  chrome.storage.local.get(['urls'], (result) => {
    const urls = result.urls || [];
    for (const url of urls) {
      chrome.tabs.create({ url });
    }
  });
}

chrome.action.onClicked.addListener(() => {
  openSavedUrls();
});

chrome.runtime.onInstalled.addListener(() => {
  openSavedUrls();
});

chrome.runtime.onStartup.addListener(() => {
  openSavedUrls();
});

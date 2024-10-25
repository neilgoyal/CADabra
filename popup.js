document.getElementById('actionButton').addEventListener('click', () => {
    // Send a message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'buttonClicked' });
      }
    });
  });
  
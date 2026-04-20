document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load existing API key on popup open
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      input.value = result.geminiApiKey;
    }
  });

  // Save key to local storage
  saveBtn.addEventListener('click', () => {
    const key = input.value.trim();
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2500);
    });
  });
});
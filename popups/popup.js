console.log('popup.js');

document.addEventListener('DOMContentLoaded', async () => {
  const checkbox = document.getElementById('getAllComments');
  const { isChecked = false } = await new Promise(resolve =>
    chrome.storage.sync.get('isChecked', resolve)
  );

  checkbox.checked = isChecked;

  const isYoutubeVideoPage = (url) => {
    return url.includes('youtube.com/watch');
  };

  const sendMessage = async (isChecked) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!isYoutubeVideoPage(tab.url)) return console.log('Not a youtube video page');
    const message = { message: 'hello from popup.js', getAllComments: isChecked };
    return chrome.tabs.sendMessage(tab.id, message);
  };

  checkbox.addEventListener('change', async (event) => {
    const isChecked = event.target.checked;
    await chrome.storage.sync.set({ isChecked });
    await sendMessage(isChecked);
    console.log(`Checkbox state saved: ${isChecked}`);
  });

  await sendMessage(isChecked);
});
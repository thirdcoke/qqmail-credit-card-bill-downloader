var mainFrame = document.getElementById('mainFrame');
console.log(mainFrame);

browser.runtime.sendMessage('Message from content script');
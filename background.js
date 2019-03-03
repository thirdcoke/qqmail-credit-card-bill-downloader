function openPage() {
    console.log('background running...');
}

browser.pageAction.onClicked.addListener(openPage);
browser.runtime.onMessage.addListener(notify);

function notify(message) {
    console.log('background received: ' + message)
}
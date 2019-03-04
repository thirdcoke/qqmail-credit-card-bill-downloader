function onError(error) {
    console.error('Error: ${error}');
}

function sendMessageToTabs(tabs) {
    for(let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            "fetch-card-data"
        ).then(parseData).catch(onError);
    }
}

function fetchData() {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(sendMessageToTabs).catch(onError);

}

function parseData(response) {
    console.log("received: "+ response);
}

browser.pageAction.onClicked.addListener(fetchData);
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
    var bolb = new Blob([JSON.stringify(response)], {type : 'application/json'});

    var downloading = browser.downloads.download({
        url: URL.createObjectURL(bolb),
        filename: response.bankName + "-" + response.billTitle,
        conflictAction: 'uniquify'
    });
    downloading.then(() => {
        console.log("Start downloading");
    }, () => {
        console.log("Download failed");
    })
}

browser.pageAction.onClicked.addListener(fetchData);
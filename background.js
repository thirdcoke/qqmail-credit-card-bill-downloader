function onError(error) {
    console.error('Error: ${error}');
}

function startProcess() {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(queryBillPageLinks).catch(onError);
}

function queryBillPageLinks(tabs) {
    for(let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            { "MessageType" : "get-bill-pages"}
        ).then(openBillPages).catch(onError);
    }
}

function openBillPages(res) {
    if(res == null) return;

    res.BillPages.forEach(element => {
        browser.tabs.create(
            {
                active: false,
                url: element 
            }).then(getBillDataFromEachPage).catch(onError);
    });
}

function getBillDataFromEachPage(tabObj){
    browser.tabs.sendMessage(
        tabObj.id,
        { "MessageType" : "get-bill-content"}
    ).then(parseData).catch(onError);
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
    });
}

browser.pageAction.onClicked.addListener(startProcess);
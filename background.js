function onError(error) {
    console.error('Error: ' + error);
}

function startProcess() {
    existedTabs = [];
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(tabs => {
        for(let tab of tabs) {
            existedTabs.push(tab.id);
            browser.tabs.sendMessage(
                tab.id,
                { "MessageType" : "get-bill-pages"}
            ).then(openBillPages)
            .catch(error => console.error("get bill page failed: " + error));
        }

        init = true;
    }).catch(error => console.error('query tabs failed: ' + error));
}

function openBillPages(res) {
    if(res == null) return;

    console.log("get " + res.BillPages.length + " pages.");
    totalTabs = res.BillPages.length;

    res.BillPages.forEach(billPageUrl => {
        browser.tabs.create(
            {
                active: false,
                url: billPageUrl 
            }).catch(error => console.error('get bill from each page failed: ' + error));
        });
}

function billPageUpdated(tabId, changeInfo, tabInfo) {

    if(!init) return;
    if(existedTabs.includes(tabId)) return;
    if(changeInfo.status != "complete") return;

    console.log('detected page updated, trying to fetch bill.');

    openedTabs.push(tabId);

    browser.tabs.sendMessage(
        tabId,
        { "MessageType" : "get-bill-content"}
    ).then(parseBillData).catch(
            error => console.error('get bill content error: '+ error)
        );
}

function parseBillData(billContent) {
    var bolb = new Blob([JSON.stringify(billContent)], {type : 'application/json'});

    var downloading = browser.downloads.download({
        url: URL.createObjectURL(bolb),
        filename: billContent.bankName + "-" + billContent.billTitle + "-" + billContent.cardName,
        conflictAction: 'uniquify'
    });

    downloading.then(() => {
        console.log("Download completed");
    }, () => {
        console.log("Download failed");
    });

    if(openedTabs.length == totalTabs) {
        browser.tabs.remove(openedTabs);
    }
}

var existedTabs = [];
var openedTabs = [];
var totalTabs  = 0;
var init = false;

browser.pageAction.onClicked.addListener(startProcess);
browser.tabs.onUpdated.addListener(billPageUpdated);
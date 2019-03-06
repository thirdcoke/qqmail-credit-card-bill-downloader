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
            browser.tabs.executeScript(
                {file: "/json2csv"}
            ).then(() => {
                browser.tabs.sendMessage(
                    tab.id,
                    { 
                        "MessageType" : "get-bill-pages",
                        "TabID" : tab.id
                    }
                ).then(createTabsForBills)
                .catch(error => console.error("get bill page failed: " + error))
            }).catch(error => console.error(error));
        }

        init = true;
    }).catch(error => console.error('query tabs failed: ' + error));
}

function createTabsForBills(res) {
    if(res == null) return;

    console.log("get " + res.BillPages.length + " pages.");
    totalTabs = res.BillPages.length;

    return;

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
        filename: billContent.BankName + "-" + billContent.BillMonth,
        conflictAction: 'uniquify'
    });

    downloading.then(() => {
        console.log("Download completed");
    }, () => {
        console.log("Download failed");
    });

    if(openedTabs.length == totalTabs) {
        browser.tabs.remove(openedTabs);
        openedTabs = [];
    }
}

var existedTabs = [];
var openedTabs = [];
var totalTabs  = 0;
var init = false;

browser.pageAction.onClicked.addListener(startProcess);
browser.tabs.onUpdated.addListener(billPageUpdated);

// browser.pageAction.onClicked.addListener(testBlob);

// function testBlob() {
//     var blob = new Blob(["hello world"]);

//     browser.downloads.download({
//         url: URL.createObjectURL(blob),
//         filename: "testFile.txt",
//         conflictAction: 'uniquify'
//     })
// }
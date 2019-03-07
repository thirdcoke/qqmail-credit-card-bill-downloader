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

    for (var year in res.BillDic) {
        res.BillDic[year].forEach(billLink => {
            totalTabs += res.BillDic[year].length;
            browser.tabs.create({
                    active: false,
                    url: billLink
                }).then(tab => tabDic[tab.id] = year)
                .catch(error => console.error('unable to create page for link: '+ billLink));
        });
    }
}

function billPageUpdated(tabId, changeInfo, tabInfo) {

    if(!init) return;
    if(existedTabs.includes(tabId)) return; // ignore pages that already opened before we start to fetching bills
    if(changeInfo.status != "complete") return; // status will updated severial times

    console.log('detected page updated, trying to fetch bill.');

    openedTabs.push(tabId); // save the id to close while finished.

    browser.tabs.executeScript(
        tabId,
        {file: "/json2csv"}
    ).then(() => {
        browser.tabs.sendMessage(
            tabId,
            { 
                "MessageType" : "get-bill-content", 
                "TabID" : tabId 
            }
        ).then(parseBillData).catch(
                error => console.error('get bill content error: '+ error)
            );
    }).catch(err => console.error("Execute json2csv on tab " + tabId + " error: " + err));
}

function parseBillData(billContent) {

    var year = tabDic[billContent.TabID];
    // if(!(year in yearDic)) yearDic[year] = [];
    // yearDic[year].push(billContent.CSV);


    // if(openedTabs.length >= totalTabs) {

    //     var toDownload = [];

    //     for(var key in yearDic) {
    //         toDownload.push(yearDic[key]);
    //     }

        var bolb = new Blob([billContent.CSV]);
        browser.downloads.download({
            url: URL.createObjectURL(bolb),
            filename: year,
            conflictAction: 'uniquify'
        });

        // browser.tabs.remove(openedTabs);
        // openedTabs = [];
    
}

var existedTabs = [];
var openedTabs = [];
var totalTabs  = 0;
var init = false;
var tabDic = {};
var yearDic = {};

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
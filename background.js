function onError(error) {
    console.error('Error: ' + error);
}

function startProcess() {
    totalPages = 0;
    openPageCount = 0;
    billParsedCount = 0;
    openedBillTabs = [];
    billLink2YearDic = {};
    jsonYear2BillLinkDictionary = {};

    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(tabs => {
        for(let tab of tabs) {
            browser.tabs.sendMessage(
                tab.id,
                { 
                    "MessageType" : "get-bill-pages",
                    "TabID" : tab.id
                }
            ).then(createTabsForBills)
            .catch(error => console.error("get bill page failed: " + error));
        }
    }).catch(error => console.error('query tabs failed: ' + error));
}

function createTabsForBills(billLinkInfo) {
    for (var year in billLinkInfo.Year2BillLinkDic) {

        billLinkInfo.Year2BillLinkDic[year].forEach(billLink => {
            billLink2YearDic[billLink] = year;
            totalPages++;
        });

        billLinkInfo.Year2BillLinkDic[year].forEach(billLink => {
            browser.tabs.create({
                active: false,
                url: billLink
            }).catch(error => console.error('unable to create page for link: '+ billLink));
        });
    }
}

var totalPages = 0;
var openPageCount = 0;
var billParsedCount = 0;

function billPageUpdated(tabId, changeInfo, tabInfo) {

    if(changeInfo.status != "complete") return; // status will updated severial times

    console.log('detected page updated, trying to fetch bill.' + (++openPageCount));

    openedBillTabs.push(tabId); // save the id to close while finished.
    browser.tabs.sendMessage(
        tabId,
        { 
            "MessageType" : "get-bill-content", 
            "TabID" : tabId,
            "TabUrl" : tabInfo.url
        }
    ).then(parseBillData)
    .catch(error => console.error('get bill content error: '+ error));
}

// year -> bill json
var jsonYear2BillLinkDictionary = {};

function parseBillData(billContent) {
    console.log( ++billParsedCount  + " bills parsed." );

    var year = billLink2YearDic[billContent.BillUrl];
    if(!(year in jsonYear2BillLinkDictionary))
        jsonYear2BillLinkDictionary[year] = { 
            "Fields" : billContent.BillFields, 
            "JsonEntities" : billContent.BillEntities 
        }; 

    jsonYear2BillLinkDictionary[year].JsonEntities = jsonYear2BillLinkDictionary[year].JsonEntities.concat(billContent.BillEntities);

    if(billParsedCount < totalPages) return;

    console.log("Parse process finished, converting and downloading...");

    var Json2CsvParser = json2csv.Parser;
    var fields = jsonYear2BillLinkDictionary[year].Fields;
    var parser = new Json2CsvParser({ fields });

    for (var yearKey in jsonYear2BillLinkDictionary) {

        var json = jsonYear2BillLinkDictionary[yearKey].JsonEntities;
        var csv;
        try{            
            csv = parser.parse(json);
        } catch (err) {
            console.error(err);
        }

        var bolb = new Blob([csv]);
        var fileName = yearKey + "-CreditCard.csv";

        browser.downloads.download({
            url: URL.createObjectURL(bolb),
            filename: fileName,
            conflictAction: 'uniquify'
        }).catch(err => console.error("Download error: " + fileName + ". " + err ));
    }

    browser.tabs.remove(openedBillTabs);
}

var openedBillTabs = [];
var billLink2YearDic = {};

browser.pageAction.onClicked.addListener(startProcess);
browser.tabs.onUpdated.addListener(billPageUpdated, { urls: ["https://mail.qq.com/bill/detail/*"] });
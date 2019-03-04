var mainFrame = document.getElementById('mainFrame');

function fetchCardData(request){
    console.log('message received.');

    let mainFrame = document.getElementById('mainFrame');
    let billDoc = mainFrame.contentDocument;

    let bankNameClass = billDoc.getElementsByClassName('detail_summary_title left bank_name');
    let bankName = bankNameClass[0].textContent;
    let cardNameClass = billDoc.getElementsByClassName('detail_summary_number left');
    let cardName = cardNameClass[0].textContent;
    let billTitle = billDoc.getElementsByClassName('bill_title')[0].textContent;

    let dateElements = billDoc.getElementsByClassName('bill_detail_transactiondate');
    var dateArray = [];
    for(var i = 0, l = dateElements.length; i < l; i++ ) dateArray.push(dateElements[i].textContent);

    let detailsElements = billDoc.getElementsByClassName('bill_detail_description');
    var detailArray = [];
    for(var i = 0, l = detailsElements.length; i < l; i++ ) detailArray.push(detailsElements[i].textContent);

    let amount = billDoc.getElementsByClassName('bill_detail_amount');
    let cardTail = billDoc.getElementsByClassName('bill_detail_cardtail');

    var bill = {
        "bankName" : bankName,
        "cardName" : cardName,
        "billTitle" : billTitle,
        "dateList" : dateArray,
        "detailList" : detailArray,
        "amountList" : amount,
        "cardTailList" : cardTail
    };
    
    return Promise.resolve(bill);
}

browser.runtime.onMessage.addListener(fetchCardData);
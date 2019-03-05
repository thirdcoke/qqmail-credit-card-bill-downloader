
// Fetch data on a single page
function fetchCardData(request){
    if(request.MessageType != "get-bill-content") return;

    // Bank name
    let bankNameClass = document.getElementsByClassName('detail_summary_title left bank_name');
    if (bankNameClass.length == 0) return Promise.reject("You're probably on the wrong page.");
    let bankName = bankNameClass[0].textContent;

    // Card number long
    let cardNumberLong = document.getElementsByClassName('detail_summary_number left')[0].textContent;

    // Month
    let billMonth = document.getElementsByClassName('bill_title')[0].textContent;

    // Transcation date List
    let transcationElements = document.getElementsByClassName('bill_detail_transactiondate');
    var transcations = [];
    for(var i = 0, l = transcationElements.length; i < l; i++ ) transcations.push(transcationElements[i].textContent);

    // Description list
    let descriptionsElements = document.getElementsByClassName('bill_detail_description');
    var descriptions = [];
    for(var i = 0, l = descriptionsElements.length; i < l; i++ ) descriptions.push(descriptionsElements[i].textContent);

    // Amount
    let amountElements = document.getElementsByClassName('bill_detail_amount');
    var amount = [];
    var currency = [];
    for(var i = 0, l = amountElements.length; i < l; i++) {
      if(amountElements[i].childNodes.length == 1) {
        amount.push(amountElements[i].innerText);
        currency.push("Currency");
      } else {
        amount.push(amountElements[i].childNodes[1].nodeValue);
        currency.push(amountElements[i].childNodes[0].innerText);
      }
    }

    // Tail number
    let cardTailElements = document.getElementsByClassName('bill_detail_cardtail');
    var cardTails = [];
    for(var i = 0, l = cardTailElements.length; i < l; i++) cardTails.push(cardTailElements[i].textContent);

    var bill = {
        "BankName" : bankName,
        "CardNumberLong" : cardNumberLong,
        "BillMonth" : billMonth,
        "DateList" : transcations,
        "DetailList" : descriptions,
        "AmountList" : amount,
        "CurrencyList" : currency,
        "CardTailList" : cardTailElements
    };
    
    return Promise.resolve(bill);
}

function fetchAllBillLinks(request) {
    if(request.MessageType != 'get-bill-pages') return;

    let mainFrame = document.getElementById('mainFrame');
    let billDoc = mainFrame.contentDocument;
    var pages = billDoc.getElementsByClassName('show_detail');

    var pageList = [];
    for(let i = 0, l = pages.length; i < l; i++) 
        pageList.push("https://mail.qq.com" + pages[i].getAttribute('href'));
        
    return Promise.resolve({ "BillPages" : pageList});
}

browser.runtime.onMessage.addListener(fetchCardData);
browser.runtime.onMessage.addListener(fetchAllBillLinks);

function testJson2Csv() {

    const Json2CsvParser = json2csv.Parser;
    const fields = ['car', 'price', 'color'];
    const opts = { fields };

    const myCars = [
        {
          "car": "Audi",
          "price": 40000,
          "color": "blue"
        }, {
          "car": "BMW",
          "price": 35000,
          "color": "black"
        }, {
          "car": "Porsche",
          "price": 60000,
          "color": "green"
        }
      ];
      
    
    try{
        const parser = new Json2CsvParser(opts);
        const csv = parser.parse(myCars);
        console.log(csv);
    } catch (err) {
        console.error(err);
    }
}
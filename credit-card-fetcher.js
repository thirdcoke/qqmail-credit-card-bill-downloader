
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

    /*
      Example json
    [
      {
        "BankName" : bankName,
        "CardNumberLong" : cardNumberLong,
        "BillMonth" : billMonth,
        "Date" : transcation,
        "Detail" : description,
        "Amount" : amount,
        "Currency" : currency,
        "CardTail" : cardTail
      },
      ... and etc.
    ]
    */

    var billItems = [];
    for (var i = 0, l = transcations.length; i < l ; i++ ) {
      billItems.push(
        {
          "BankName" : bankName,
          "CardNumLong" : cardNumberLong,
          "BillMonth" : billMonth,
          "Date" : transcations[i],
          "Detail" : descriptions[i],
          "Amount" : amount[i],
          "Currency" : currency[i],
          "CardTail" : cardTails[i]
        }
      );
    }

    const Json2CsvParser = json2csv.Parser;
    const fields = ["BankName", "CardNumLong", "BillMonth", "Date", "Detail", "Amount", "Currency", "CardTail"];
    const opts = { fields };

    var csv;

    try {
      const parser = new Json2CsvParser(opts);
      csv = parser.parse(billItems);
    } catch (err) {
      console.error(err);
    }

    return Promise.resolve({ "TabID" : request.TabID, "CSV" : csv });
}

function fetchAllBillLinks(request) {
    if(request.MessageType != 'get-bill-pages') return;

    let mainFrame = document.getElementById('mainFrame');
    let billDoc = mainFrame.contentDocument;

    // get links for each year
    /*
    example json
    {
      "2019 bill" : [ JanuaryBillLink, FebuaryBillLink ],
      "2018 bill" : [ JanuaryBillLink, ... , DecemberBillLink ]
    }
    */

    var resList = {};
    var yearsRows = billDoc.getElementsByClassName('year_row');
    var monthRows = yearsRows[0].parentNode.getElementsByClassName('month_list');

    for(var i = 0; i < yearsRows.length; i++) {
      var yearText = yearsRows[i].getElementsByClassName('bill_year')[0].innerText;
      var detailBillsRows = monthRows[i].getElementsByClassName('show_detail');
      resList[yearText] = [];
      for(var j = 0; j < detailBillsRows.length; j++) {
        resList[yearText].push("https://mail.qq.com" + detailBillsRows[j].getAttribute('href'));
      }
    }
   
    return Promise.resolve({ "BillDic" : resList});
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
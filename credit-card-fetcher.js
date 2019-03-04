var mainFrame = document.getElementById('mainFrame');

function fetchCardData(request){
    console.log('message received.');
    console.log(request);
    return Promise.resolve("Solved");
}

browser.runtime.onMessage.addListener(fetchCardData);
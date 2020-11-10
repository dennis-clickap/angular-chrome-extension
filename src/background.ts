let _color: any = null;

chrome.runtime.onInstalled.addListener(() => {
    

    chrome.webNavigation.onCompleted.addListener(() => {
        chrome.storage.sync.get('color', ({ color }) => {
            console.log(color);
            _color = color;
            
        });
        chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
            chrome.pageAction.show(id);
            console.log(id); 
            console.log(_color); 
            chrome.tabs.executeScript(
                id,
                { code: 'document.body.style.backgroundColor = "' + _color + '";' }
            );
        });
    }, { url: [{ urlMatches: 'google.com' }] });
});
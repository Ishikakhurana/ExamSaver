const puppeteer=require("puppeteer");
//topics whose playlist one wants to get
//one can change according to their requirement
let topics=["Java Foundation pepcoding","Operating System"];
let notes=["Java","Operating System"];
//one has to sign in to google account due to restrictions once before running this script.
//fails in case of 2-factor authentication requirement 
let [id,password]=require('./critical.js');
//

(async function(){
    //new chromium window
let browser=await puppeteer.launch({headless:false,
    defaultViewport: null,
    args: ["--start-maximized"]});
    //new browser page 
    let allpages=await browser.pages();
    //first page for logging in
    let tab=allpages[0];
    await tab.goto("https://www.youtube.com/");
    //click on sign in
    await tab.click('.style-scope.ytd-button-renderer.style-suggestive.size-small');
    //click on email input and type
    await tab.waitForSelector('input[type="email"]'); 
    await tab.click('input[type="email"]');  
    await tab.type('input[type="email"]',id);
    await tab.click('#identifierNext');
    await tab.waitForTimeout(3000);
    //click on password input and type
    await tab.waitForSelector('input[type="password"]');
    await tab.click('input[type="password"]');  
    await tab.type('input[type="password"]', password);
    await tab.click('#passwordNext');
    await tab.waitForTimeout(5000);

// calling searchPlaylist 
    for(let i=0;i<topics.length;i++){
    await searchPlaylist(browser,topics[i]+" playlist");
    }
    

    
console.log("playlist added")


let newTab= await browser.newPage(); // noteshub
for(let i=0;i<notes.length;i++){
   await notesAndPapers(newTab,browser,notes[i]);
    }
    
console.log("notes available")


})().then(function(){
    console.log("done!");
}).catch(function(error){
console.log(error);
});
// searchPlaylist=>function to search playlists and save most liked out of top 5 entries
async function searchPlaylist(browser,topic){
    //new page for each topic search
    let newtab=await browser.newPage();
    await newtab.goto("https://www.youtube.com/")
    await newtab.waitForTimeout(5000);
    //search topic
    await newtab.click('div#search-container');
    await newtab.type('div#search-container',topic);
    await newtab.click('button#search-icon-legacy');
    await newtab.waitForTimeout(5000);
    //gets all videos on opage for topic search
    let allVideosatag=await newtab.$$('div#contents .style-scope.ytd-item-section-renderer[prominent-thumb-style="DEFAULT"] a#thumbnail');
    //info array to store max likes and links for those 
    let info={"max":0,"maxlink":""};
    
    for(let i=0;i<5;i++){
        //for first 5 i.e. top 5 recommendations find link and call getMostLiked function
        let link=await newtab.evaluate(function(elem){
            return elem.getAttribute('href');
        },allVideosatag[i]);
        link="https://www.youtube.com"+link;
        await getMostLiked(link,browser,info);
    }
    // redirect this tab to most liked playlist
    await newtab.goto(info['maxlink']);
    //save to playlist
    await newtab.waitForSelector('[aria-label="Save to playlist"]')
    await newtab.click('[aria-label="Save to playlist"]');
    //create new playlist and name it topic playlist according to current topic 
    await newtab.waitForSelector('tp-yt-paper-item[role="link"]');
    await newtab.click('tp-yt-paper-item[role="link"]');
    await newtab.waitForSelector('input.style-scope.tp-yt-paper-input');
    await newtab.click('input.style-scope.tp-yt-paper-input');
    await newtab.type('input.style-scope.tp-yt-paper-input',topic);
    await newtab.click('#button.style-scope.ytd-button-renderer.style-blue-text.size-default');
    await newtab.waitForTimeout(500);
   
    //close this tab
    await newtab.close();


    
}
//getMostLiked=>gets most liked playlist for each topic out of 5 playlists
async function getMostLiked(link,browser,info){
  //new tab for getting likes and determining maximum liked
    let tabV= await browser.newPage()
   await  tabV.goto(link);
   await tabV.waitForSelector('yt-formatted-string#text.style-scope.ytd-toggle-button-renderer.style-text');
   let likeselem=await tabV.$('yt-formatted-string#text.style-scope.ytd-toggle-button-renderer.style-text');
   let likesString=await tabV.evaluate(function(elem){
    return elem.getAttribute('aria-label');
},likeselem);
//string likes to Number ->for comparison
let likesNumber=parseInt(likesString.split(" likes")[0].trim().split(',').join(""));
//compare likes to previous max ->if more then previous->update max and maxlink  
   if(info['max']<likesNumber){
       info['max']=likesNumber;
       info['maxlink']=link;

   }
//close this tab
   await tabV.close();


}
async function notesAndPapers(tab,browser,topic){
    
    await tab.goto("https://noteshub.co.in/");
    await tab.waitForSelector('.landing-main input[aria-autocomplete="list"]');
    await tab.click('.landing-main input[aria-autocomplete="list"]');
    await tab.type('.landing-main input[aria-autocomplete="list"]',topic);
    await tab.waitForTimeout(300);
    await tab.waitForSelector('[role="option"]');
    await tab.waitForTimeout(300);
    await tab.click('[role="option"]');
    await tab.waitForSelector('div[aria-haspopup="listbox"]');
    await tab.click('div[aria-haspopup="listbox"]');
    await tab.waitForSelector('li[aria-label="Question Papers"]');
    await tab.click('li[aria-label="Question Papers"]');
    await tab.waitForSelector('div.views');
    // let cards=await tab.$$('div.card-stats');
    let infoViews={'maxViews':0,'maxIndex':0}
    let views= await tab.$$('div.views');
    for(let i=0;i<views.length;i++){
let strViews=await tab.evaluate(function(elem){
    return elem.innerText; 
},views[i]);
let numViews=parseInt(strViews.split(" Views")[0].trim());
if(numViews>infoViews['maxViews']){
    infoViews['maxViews']=numViews;
    infoViews['maxIndex']=i;
}
}
let idx=infoViews['maxIndex'];
// let detailsBtn=await tab.$$('[label="Details"]');
let cards=await tab.$$('.col-lg-4.col-md-4.col-sm-6.col-xs-12.ng-star-inserted');

await cards[idx].click();
await tab.waitForTimeout(3000);
// await tab.waitForSelector('[title="Download"]');
// await tab.waitForSelector('[label="View"]');
// await tab.click('[label="View"]');
// await tab.waitForSelector('')


    }
   
    

var API_KEY = "AIzaSyA_T85eMpN5HkrZSXSAoi0vhWRCsjW6AMo";
var table_ref=document.getElementById('table1');




async function formSearch(e) {
  e.preventDefault();
  
  var searchValue = document.getElementById("searchInput").value;

  


  const apidata= await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&type=video&part=snippet&maxResults=50&q=${searchValue}`);
  const searchResult= await apidata.json();
  let arr=[];
  fetchAllVideos(searchResult,arr);

  setTimeout(()=>{
    const pagination_element=document.getElementById('pagination');
    let curr_page=1;
    let rows=10;
    document.getElementById('table1').innerHTML="";
    displayList(arr,rows,curr_page);
    pagination_element.innerHTML="";
    SetupPagination(arr,pagination_element,rows,curr_page);
  },1000);
   
    
}

async function displayVideos(arr,item,videoDataStatistics) {
    var date1 = new Date(item.snippet.publishedAt);
    var date2 = Date.now();
    var timeElapsed = getTimeElapsedSinceUpload(date1, date2);
    var viewCount = getViewCount(videoDataStatistics.items[0].statistics.viewCount);

  const channelInfo=await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${item.snippet.channelId}&key=${API_KEY}`)

  const channelInfoJson=await channelInfo.json();
  //console.log(channelInfoJson.items[0].snippet.thumbnails.default.url)
  
  videoData={
    videoThumbnail:item.snippet.thumbnails.high.url,
    videoTitle:item.snippet.title,
    videoId:item.id.videoId,
    viewCount:viewCount,
    timeElapsed:timeElapsed,
    ChannelImageURL:channelInfoJson.items[0].snippet.thumbnails.default.url,
    channelId:item.snippet.channelId,
    channelTitle:item.snippet.channelTitle,
    description:item.snippet.description

  };
  
  arr.push(videoData);
 
}

async function fetchSingleVideo(arr,item)
{
  const videoData=await fetch( `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${item.id.videoId}&part=snippet,statistics`);
  const videoStatistics=await videoData.json();
    
  await displayVideos(arr,item,videoStatistics);
}
 
function fetchAllVideos(searchResult,arr) {
   
  searchResult.items.forEach((item) => 
  {
      fetchSingleVideo(arr,item);
    
  });

    
}

function getViewCount(count) {
  if (count >= 10 ** 6) {
    return (count / 10 ** 6).toFixed(1) + "M views";
  } else {
    if (count >= 1000) {
      return parseInt(count / 1000) + "K views";
    }
  }

  return count + " views";
}

function getTimeElapsedSinceUpload(date1, date2) {
  var daysElapsed = (date2 - date1) / (1000 * 60 * 60 * 24 * 31 * 12);
  daysElapsed = parseInt(daysElapsed);
  if (daysElapsed <= 0) {
    daysElapsed = (date2 - date1) / (1000 * 60 * 60 * 24 * 31);
    daysElapsed = parseInt(daysElapsed);
    if (daysElapsed <= 0) {
      daysElapsed = (date2 - date1) / (1000 * 60 * 60 * 24);
      daysElapsed = parseInt(daysElapsed);
      if (daysElapsed <= 0) {
        daysElapsed = (date2 - date1) / (1000 * 60 * 60);
        daysElapsed = parseInt(daysElapsed);
        daysElapsed += " hours ago";
      } else daysElapsed += " days ago";
    } else {
      daysElapsed += " months ago";
    }
  } else {
    daysElapsed += " years ago";
  }

  return daysElapsed;
}



function displayList(items,wrapper,rows_per_page,page)
{
  
  wrapper.innerHTML="";
  page--;
  
  let start=rows_per_page*page;
  let end=start+rows_per_page;
  let paginated_items=items.slice(start,end);
  for (let i = 0; i < paginated_items.length; i++) {

    videoData = `
    <tr>
       <td>
           <img width="306px" height="202px" src="${paginated_items[i].videoThumbnail}"/>
       </td>
 
       <td>
           <div class="videoInfo">
               <div class="title">
                   <a target="_blank" href="https://www.youtube.com/watch?v=${paginated_items[i].videoId}">${paginated_items[i].videoTitle}</a>
               </div>
               <div class="responsive-display">
                  <div class="videoStatistics">
                      ${paginated_items[i].viewCount} <div class="dot"></div> ${paginated_items[i].timeElapsed}
                  </div>
                  <div class="channel">
                      <img width="30px" height="20px" src="${paginated_items[i].ChannelImageURL}"/>
                      <a target="_blank" href="https://www.youtube.com/channel/${paginated_items[i].channelId}"> ${paginated_items[i].channelTitle} </a>
                  </div>
               </div>
               <div class="description">
                   ${paginated_items[i].description}
               </div>
 
           <div>     
       </td>
   </tr>
   `;

    wrapper.innerHTML+=videoData;
    
  }
  

}




function SetupPagination(items,wrapper,rows_per_page,current_page)
{
  
   wrapper.innerHTML="";
   let page_count=Math.ceil(items.length/rows_per_page);
   for (let i = 1; i < page_count+1; i++) {

   let button=PaginationButton(i,items,rows_per_page,current_page);
   wrapper.appendChild(button);


   }
}

function PaginationButton(page,items,rows_per_page,current_page)
{
  let button=document.createElement('button');
  button.innerText=page;
  if(current_page==page)
  {
    button.classList.add('active');
  }

  displayList(items,table_ref,rows_per_page,current_page);

  button.addEventListener('click',()=>{

    
    current_page=page;
    
    displayList(items,table_ref,rows_per_page,current_page);
    let curr_btn=document.querySelector('.pagenumber button.active');
    curr_btn.classList.remove('active');
    button.classList.add('active');
  })

  
  return button;
}
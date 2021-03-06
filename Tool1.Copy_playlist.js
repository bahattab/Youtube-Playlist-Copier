var str = '';
str += '<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">';
str += '<div class="container"><div class="row"><div class="col-sm-8 col-sm-offset-2">';
str += '<h1 class="text-center">Tạo playlist Copy</h1><form action="" method="POST" class="form-horizontal" role="form">'+
	'<div class="form-group">'+
		'<label for="inputKeyw" class="col-sm-4 control-label">Danh sách Từ khóa:</label>'+
		'<div class="col-sm-8">'+
			'<input type="text" name="keyw" id="inputKeyw" class="form-control" value="" required="required" title="">'+
		'</div>'+
	'</div>'+
	'<div class="form-group">'+
		'<label for="inputTotalpll" class="col-sm-4 control-label">Số lượng Pll:</label>'+
		'<div class="col-sm-8">'+
			'<input type="number" name="total_pll" id="inputTotalpll" class="form-control" value="10" required="required" title="">'+
		'</div>'+
	'</div>'+
	'<div class="form-group">'+
		'<label for="inputVideos" class="col-sm-4 control-label">ID video của bạn:</label>'+
		'<div class="col-sm-8">'+
			'<input type="text" name="idvideos" id="inputVideos" class="form-control" value="" required="required" placeholder="ID video, cách nhau bằng dấu phẩy">'+
		'</div>'+
	'</div>'+
	'<div class="form-group">'+
		'<div class="col-sm-8 col-sm-offset-4">'+
			'<button type="button" id="create_now" onclick="createPlaylists()" class="btn btn-primary">Tạo ngay và luôn</button>'+
		'</div>'+
	'</div>'+
'</form>'+
'</div></div>'+
'<div class="row"><div class="col-sm-8 col-sm-offset-2" id="result_text"></div></div>'+
'<div class="row"><div class="col-sm-8 col-sm-offset-2" id="result_area"></div></div>'+
'</div>'
;


var keyword = '';
var total_pll = 0;
var total_videos = '';
//var total_videos = 'AVVbZzMhJHU';
var all_videos = [];
//var total_pll = 2;
var plls = [];
var total_times = 0;
var page_times = 1;
var security_token = '';
var api_key = 'AIzaSyAsD0yc-a0-Jaaj2YySRMVXmfOwXj9wmAQ';
var i_video = 0;
var current_video_id = '';
total_pll -= 1;
var last_length = 0;
var keywords = [];
var ikws = 0;
var per_keyword = 0;
var plls_per_key = 0;

function createPlaylists()
{
	keyword = document.getElementById('inputKeyw').value;
	keywords = keyword.split(',');
	total_pll = document.getElementById('inputTotalpll').value;
	total_videos = document.getElementById('inputVideos').value;
	total_videos = total_videos.replace(/ /g,'');
	all_videos = total_videos.split(',');
	document.getElementById("create_now").classList.add("disabled");
	document.getElementById("create_now").innerHTML = "Đang tạo ...";
	per_keyword = total_pll / keywords.length;

	//document.getElementById("create_now").setAttribute("class", "disabled");
	search(keywords[ikws], page_times);
}


RegExp.prototype.execAll = function(string) {
	var matches = [];
	var match = null;
	while ( (match = this.exec(string)) != null ) {
		var matchArray = [];
		for (var i in match) {
			if (parseInt(i) == i) {
				matchArray.push(match[i]);
			}
		}
		matches.push(matchArray);
	}
	return matches;
}
function getStringBetween(string, firstS, lastS)
{
	str1 = string.split(firstS);
	if(str1.length < 1) return '';
	str2 = str1[1].split(lastS);
	if(str2.length < 1) return '';
	return str2[0];
}
function search(kw, page)
{
	var key_encode = encodeURI(kw);
	var pll_param = '&sp=EgIQAw%253D%253D';
	var page_param = '&page=' + page;
	var url = 'https://www.youtube.com/results?search_query='+key_encode+pll_param+page_param;
	var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (xhttp.readyState == 4 && xhttp.status == 200) {
				filterAllPlaylist(xhttp.responseText);
			total_times += 1;
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

function filterAllPlaylist(page_string)
{
	var content_string = '';
	
	content_string = getStringBetween(page_string, 'class="item-section">','class="branded-page-box');
	var regex = /&amp;list=([A-Za-z0-9-_]{30,40})/g;
	match = regex.execAll(content_string);
	for(var i = 0; i < match.length; i++)
	{
		if(plls.length > total_pll) break;
		if(plls.indexOf(match[i][1]) == -1)
		{
			plls.push(match[i][1]);
			plls_per_key += 1;
		}
		
	}
	//console.log(plls.length);

	if(plls.length >= total_pll || (plls.length == last_length && ikws >= keywords.length ) ) {
		console.log('Total playlist has been got: ' + plls.length);
		var url = 'https://www.youtube.com/playlist?list=' + plls[0];
		var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (xhttp.readyState == 4 && xhttp.status == 200) {
					security_token = getStringBetween(xhttp.responseText, 'data-playlist-edit-xsrf-token="', '=" data-');
					security_token = security_token.replace('ata-playlist-edit-xsrf-token="', '');
					security_token += '%3D';
					autoCreate();
				}
			};
		xhttp.open("GET", url, true);
		xhttp.send();
		
	} else {
		if(plls.length == last_length || plls_per_key >= per_keyword)
		{
			ikws += 1;
			page_times = 0;
			plls_per_key = 0;
		}
		document.getElementById('result_text').innerHTML = "<p class='text-success'>Getting: "+plls.length+" playlist</p>";
		page_times += 1;
		last_length = plls.length;
		search(keywords[ikws], page_times);
	}
	
}

function getPlaylistInfo(id)
{
	
	//get data
	var url = 'https://www.googleapis.com/youtube/v3/playlists?key=' + api_key + '&id=' + id + '&part=id,snippet';
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		
	};
	xhttp.open("GET", url, false);
	xhttp.send();
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		var arr = JSON.parse(xhttp.responseText);
		var res = [];
		try {
			res['title'] = arr['items'][0]['snippet']['title'];
			res['des'] = arr['items'][0]['snippet']['description'];
		} catch(e) {}
		return res;
	} else return [];
}

function sendRq(postVar)
{
	var url = 'https://www.youtube.com/playlist_ajax?action_create_playlist=1';
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		
	};
	xhttp.open("POST", url, false);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send(postVar);
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		return (xhttp.responseText);
	}
}

function sendPostRq(url, postVar)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		
	};
	xhttp.open("POST", url, false);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send(postVar);
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		return (xhttp.responseText);
	}
}
function sendGetRq(url)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		
	};
	xhttp.open("POST", url, false);
	xhttp.send();
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		return (xhttp.responseText);
	}
}

function autoCreate()
{
	var url = '';
	var postVar = '';
	var page = '';
	var tmp = [];
	var plid = '';
	var doneList = [];
	for(var j = 0; j < total_pll; j++)
	{
		i = Math.floor((Math.random() * plls.length) + 1);
		tmp = getPlaylistInfo(plls[i]);
		var postVar = 'video_ids&source_playlist_id='+plls[i]+'&n='+encodeURI(tmp["title"])+'&p=public&session_token='+security_token;
		page = sendRq(postVar);
		try {
			pJson = JSON.parse(page);
			plid = pJson['result']['playlistId'];
			if(total_videos.length > 0) {
				addVideoToPlaylist(plid);
				moveVideoOnTop(plid);
			}
			setDescription(plid, tmp['des']);
			console.log('Done: https://www.youtube.com/playlist?list=' + plid);
			document.getElementById('result_text').innerHTML = "<p class='text-success'>Done: https://www.youtube.com/playlist?list="+plid+"</p>";
			document.getElementById('result_area_id').value += plid + "\r\n";
		} catch(e) {}
		
		//break;
	}
	document.getElementById("create_now").classList.remove("disabled");
	document.getElementById("create_now").innerHTML = "Đã xong !";
	window.setTimeout(function() {document.getElementById("create_now").innerHTML = "Tạo ngay và luôn";}, 2000);
	console.log('Done !!!');
	return;
}

function addVideoToPlaylist(plid)
{
	if( (i_video+1) > all_videos.length ) {
		i_video = 0;
	}
	videoid = all_videos[i_video];
	current_video_id = videoid;
	i_video += 1;
	var url = 'https://www.youtube.com/playlist_edit_service_ajax?action_add_video=1';
	var postVar = 'video_id='+videoid+'&playlist_id='+plid+'&session_token='+security_token;
	var req = sendPostRq(url, postVar);
	return req;
}

function moveVideoOnTop(plid)
{
	url = 'https://www.youtube.com/playlist?list=' + plid;
	page_str = sendGetRq(url);
	var regex = /data-set-video-id=[\\]?\"([A-F0-9]{15,20})/g;
	match = regex.execAll(page_str);
	first_video = match[0][1];
	//data-set-video-id="
	solan = 0;
	if (page_str.indexOf("/browse_ajax?action_continuation=1") >= 0)
	{
		do {
			
			tmp_str = getStringBetween(page_str, '/browse_ajax?action_continuation=1', '"');
			tmp_str = tmp_str.replace('\\u0026amp;', '&');
			tmp_str = tmp_str.replace('u0026amp;', '&');
			tmp_str = tmp_str.replace('&amp;', '&');
			tmp_str = tmp_str.replace('\\', '');
			tmp_str = tmp_str.replace(/\\/g, '');
			u1 = 'https://www.youtube.com/browse_ajax?action_continuation=1' + tmp_str;
			page_str = sendGetRq(u1);
			solan += 1;
		} while(page_str.indexOf("/browse_ajax?action_continuation=1") >= 0);
	}
	//var regex = /data-set-video-id=[\\]?\"([A-F0-9]{15,20})/g;
	match = regex.execAll(page_str);
	last_video = match[match.length-1][1];
	//first_video = match[0][1];
	
	url = 'https://www.youtube.com/playlist_edit_service_ajax/?action_move_video_before=1';
	postVar = 'playlist_id='+plid+'&set_video_id='+last_video+'&moved_set_video_id_successor='+first_video+'&session_token='+security_token;
	str = sendPostRq(url, postVar);
}
function setDescription(plid, desc)
{
	url = 'https://www.youtube.com/playlist_edit_service_ajax?action_set_playlist_description=1';
	postVar = 'playlist_id='+plid+'&playlist_description='+encodeURI(desc)+'&session_token='+security_token;
	str = sendPostRq(url, postVar);
}
document.body.innerHTML = str;
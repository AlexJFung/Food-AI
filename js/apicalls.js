var tokenURL = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';
var audioURL = "https://speech.platform.bing.com/synthesize";
var recogniseURL = "https://speech.platform.bing.com/recognize/query";

var scope = "https://speech.platform.bing.com";
var clientId = "Alex";
var clientSecret = "REMOVED";
var token = "default";
var textToSpeak = 'Hallo';
var language = 'de-DE';
var nameLanguage = 'Microsoft Server Speech Text to Speech Voice (zh-CN, HuiHuiRUS)';
var sendString = "<speak version='1.0' xml:lang='"+language+"'><voice xml:lang='"+language+"' xml:gender='Female' name='"+nameLanguage+"'>"+textToSpeak+"</voice></speak>"
var context = new AudioContext();
var speechBuffer = null;

function state(){
	this.intent="none";
	this.respond="none"
};
var timeline=[];

function requestAudio()
{
    changeLanguage();

    renewToken();
    textToSpeak = $("#my-respond")[0].value;
    sendString = "<speak version='1.0' xml:lang='"+language+"'><voice xml:lang='"+language+"' xml:gender='Female' name='"+nameLanguage+"'>"+textToSpeak+"</voice></speak>";

    console.info($("#text-to-speak"));

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function()
    {
        console.log("xhttp ready");
        if (xhttp.readyState == 4 && xhttp.status == 200)
        {
            console.log("xhttp ready inside if");
            context.decodeAudioData(xhttp.response, function(buffer)
            {
                console.log("xhttp ready inside buffer");
                speechBuffer = buffer;
                console.info(speechBuffer);
                playAudio(speechBuffer);
            });

        }
    };

    xhttp.open("POST", audioURL, true);
    xhttp.setRequestHeader("Content-type", 'application/ssml+xml');
    xhttp.setRequestHeader("Authorization", 'Bearer ' + token);
    xhttp.setRequestHeader("X-Microsoft-OutputFormat", 'riff-16khz-16bit-mono-pcm');
    xhttp.setRequestHeader("X-Search-AppId", '07D3234E49CE426DAA29772419F436CA');
    xhttp.setRequestHeader("X-Search-ClientID", '1ECFAE91408841A480F00935DC390960');
    xhttp.responseType = 'arraybuffer'

    xhttp.send(sendString);
}

//API calls for FoodAI/etc questions
function api_ai(temp){
  console.log("api ai");
	var callid= temp.replace(/ /,"%20");
    var url = "REMOVED"
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.setRequestHeader('Authorization', 'Bearer REMOVED');
	xhr.send();

	xhr.onreadystatechange = function () {
	console.log("api ai status : "+xhr.readyState);
		if (xhr.readyState == 4 && xhr.status == 200) {
			console.log("inside if");
			var json = JSON.parse(xhr.responseText);
			console.log("json :: "+JSON.stringify(json));
			if(json.result.fulfillment.speech == ""){
				switch(json.result.action){
						case "weather.search" :
							weatherAPI(json);
							break;
            case "news.search" :
							newsAPI(json);
							break;
						default:
							$("#my-respond")[0].value = "Sorry, I am not trained for this question right now. Can I help you with something else?";
							break;
					}

			}else{
				$("#my-respond")[0].value = json.result.fulfillment.speech;
			}
		}

	}
    setTimeout(function() {
            console.log("calling request audio");
            requestAudio();
        },2000);


}

function weatherAPI(json){
	var xhr = new XMLHttpRequest();
	var url = "http://api.openweathermap.org/data/2.5/weather?id=5384170&appID=REMOVED";
	xhr.open('GET', url, true);

	xhr.setRequestHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
	xhr.setRequestHeader("Access-Control-Allow-Origin", "http://api.openweathermap.org/");
  xhr.setRequestHeader("Access-Control-Allow-Methods", "GET");

	xhr.send();
	xhr.onreadystatechange = function () {
		console.log("weather status : "+xhr.readyState);
		if (xhr.readyState == 4 && xhr.status == 200) {
			console.log("inside if");
			var json = JSON.parse(xhr.responseText);
			var val = Math.ceil(9/5 *(parseInt(json.main.temp) - 273) + 32);
				if (val >= 80)
				{
					$("#my-respond")[0].value = "The weather in Pomona is "+val+ ".  It's hot outside, say 'Cold' for a restaurant for food or beverages.";
					document.getElementById("my-text").innerHTML = 'Please say "Cold" to continue';
				}
				if (val <= 70)
				{
					$("#my-respond")[0].value = "The weather in Pomona is "+val+ ".  It's cold outside, say 'Hot' for a restaurant for food or beverages.";
					document.getElementById("my-text").innerHTML = 'Please say "Hot" to continue';
				}
				else
				{
					$("#my-respond")[0].value = "The weather in Pomona is  "+val+ ", degrees. Nice weather we're having, how about a random choice?";

				}
		}
	}

}

function newsAPI(json){
    var apikey="REMOVED";
    var source="bbc-news";
    var sortBy="top";//top latest popular
    var url="";
	var xhr = new XMLHttpRequest();

    if (json.result.action=="news.search"){
        url="https://newsapi.org/v1/articles?source="+source+"&sortBy="+sortBy+"&apiKey="+apikey;
        xhr.open('GET', url, true);
	    xhr.send();
	    xhr.onreadystatechange = function () {
	        console.log("api ai status : "+xhr.readyState);
		    if (xhr.readyState == 4 && xhr.status == 200) {
			    var json2 = JSON.parse(xhr.responseText);
				var random = Math.floor(Math.random() * (json2.articles.length) );
                $("#my-respond")[0].value=source+" : "+json2.articles[random].title;
            }
        }
    }
}

function check_entities(){
	var flag = "";
	for (var i in timeline[timeline.length-1].entities ){
		if (timeline[timeline.length-1].entities[i]!=timeline[timeline.length-2].entities[i]){
			if (timeline[timeline.length-1].entities[i]!="none" && timeline[timeline.length-2].entities[i]!="none"){

			};
			if (timeline[timeline.length-1].entities[i]=="none"){
				timeline[timeline.length-1].entities[i]=timeline[timeline.length-2].entities[i];
			};
		};
	}

}

function QandA(question){

	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://westus.api.cognitive.microsoft.com/qnamaker/v1.0/knowledgebases/5cd82f22-a523-44ac-acde-7f2689078c85/generateAnswer', true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json.email + ", " + json.password)
		}
	}

}

function renewToken()
{
    var xhr = new XMLHttpRequest();
    $.ajax(
    {
        type: 'POST',
        url: "https://api.cognitive.microsoft.com/sts/v1.0/issueToken",
        beforeSend: function(xhrObj)
        {
            xhrObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhrObj.setRequestHeader("Content-Length", "0");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "REMOVED");
        },
        data:
        {
            'grant_type': 'client_credentials',
            'client_id': clientId,
            'client_secret': clientSecret,
            'scope': 'https://speech.platform.bing.com'
        }
    }).done(function(data)
    {
        token = JSON.parse(xhr.response);
    });
}

function playAudio()
{
   // var context = new AudioContext();
    var source = context.createBufferSource();
    source.buffer = speechBuffer;
    source.connect(context.destination);
    talking(source.buffer.duration);
    source.start(0);
}

function recogniseSpeech(token, blob)
{
    console.log("recognize");
    changeLanguage();

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function()
    {
        if (xhttp.readyState == 4 && xhttp.status == 200)
        {
            console.info(xhttp.response);
            var obj = JSON.parse(xhttp.response);
            console.log("json api:: "+JSON.stringify(obj));
            document.getElementById("my-text").value = obj.header.name;
            api_ai(obj.header.name);
        }
    };

    var data = recogniseURL + '?';

    data += "version=" + '3.0' + '&';
    data += "requestid=" + '1d4b6030-9099-11e0-91e4-0800200c9a66' + '&';
    data += "appID=" + 'D4D52672-91D7-4C74-8AD8-42B1D98141A5' + '&';
    data += "format=" + 'json' + '&';
    data += "locale=" + language + '&';
    data += "device.os=" + 'wp7' + '&';
    data += "scenarios=" + 'ulm' + '&';
    data += "instanceid=" + '1d4b6030-9099-11e0-91e4-0800200c9a66';

    xhttp.open("POST", data, true);

    xhttp.setRequestHeader("Authorization", "Bearer " + token);
    xhttp.setRequestHeader("Content-length", blob.length);
    xhttp.setRequestHeader("Content-Type", 'audio/wav; samplerate=8000');

    xhttp.send(blob);
}

function ToogleSpeechToText(blob)
{
    var tokenURL = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function()
    {
        if (xhttp.readyState == 4 && xhttp.status == 200)
        {

            token = xhttp.responseText;
            recogniseSpeech(token,blob);

        }
    };

    var data = '';

    xhttp.open("POST", tokenURL, true);

    data += 'grant_type='+'client_credentials'+'&';
    data += 'client_id='+ "Artigen" + '&';
    data += 'client_secret='+ "REMOVED"+ '&';
    data += 'scope='+'https://speech.platform.bing.com';

    xhttp.setRequestHeader("Ocp-Apim-Subscription-Key", "REMOVED");
    xhttp.setRequestHeader("Authorization", "Bearer " + token);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader("Content-length", data.length);

    xhttp.send(data);
}

function changeLanguage()
{
    var e = document.getElementById("languageSelect");
    var lang = e.options[e.selectedIndex].value;

    switch (lang)
    {
        case "Chinese":
            language = "zh-CN";
            nameLanguage = "Microsoft Server Speech Text to Speech Voice (zh-CN, HuiHuiRUS)";
            break;
        case "English":
            language = "en-GB";
            nameLanguage = "Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)";
            break;
        default:
            language = "en-GB";
            nameLanguage = "Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)";
            break;
    }
}

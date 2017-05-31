$(document).ready(function() {
	document.addEventListener("deviceready", onDeviceReady, false);
});

var recognition;
function onDeviceReady() {	
	
	$('#speak').click( function() {
		recognition = new SpeechRecognition();			
		recognition.onresult = function(event) {
			if (event.results.length > 0) {
				console.log(event.results[0][0].transcript);				
				q.value = event.results[0][0].transcript;
			}
		};		
		recognition.start();
	});
}

/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var analyserContext = null;
var recflag = 'start';

function gotBuffers( buffers )
{
    audioRecorder.exportWAV( doneEncoding );
}

function doneEncoding( blob )
{
    ToogleSpeechToText(blob);
}

function toggleRecording( e ) {
   // if (e.classList.contains("recording")) {
   //      // stop recording
   //      audioRecorder.stop();
   //      e.classList.remove("recording");
   //      audioRecorder.getBuffers( gotBuffers );
   //  } else {
   //      // start recording
   //      if (!audioRecorder)
   //          return;
   //      e.classList.add("recording");
   //      audioRecorder.clear();
   //      audioRecorder.record();
   //  }
	// window.clearInterval(toggleRecording);
	if(recflag === 'start'){
		//window.alert("start");
		console.log("toggle start");
        changeRunning(3);//Thinking
		recflag = 'stop';
		if (!audioRecorder){
            console.log("not");
			return;
		}
		audioRecorder.clear();
        audioRecorder.record();
		window.setTimeout(toggleRecording, 4000);

	}else if(recflag === 'stop'){
		//window.alert("stop");
		console.log("toggle stop");
        changeRunning(1);
		recflag = 'start';
		audioRecorder.stop();
		audioRecorder.getBuffers( gotBuffers );
		//window.setTimeout(toggleRecording, 1000);
}
	// }else{
	// 	//window.alert("play");
	// 	console.log("toggle play");
  //       talkingOpen();
	// 	recflag = 'start';
	// 	requestAudio();
	// 	window.setTimeout(function(){
  //           changeRunning();
  //           //toggleRecording;
  //       }, 7000);
	// }
}

function gotStream(stream)
{
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });

}



window.addEventListener('load', initAudio );
//window.setInterval(toggleRecording,11000);

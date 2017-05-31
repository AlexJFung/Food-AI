/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {

        //document.addEventListener("deviceready", onDeviceReady, false);
        document.getElementById("genderButton").addEventListener("click", function(){
          changeGender();
        }, false);
        document.getElementById("container").addEventListener("click", function(){
          toggleRecording(this);
        }, false);
        changeRunning(1);
        mkPreload();

       // this.receivedEvent('deviceready');
        //navigator.notification.alert("My media: "+Media);
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var plFiles = [];
var has_touch = 'ontouchstart' in document.documentElement;
var accX, accY, width, height, xA, yA, movement, pX, pY;
var st = 1;
var gender = "girl";



if(has_touch || screen.width <= 699) {
  (resize = function() {
    height = $(window).height();
    width = $(window).width();

    $('#container').width(width).height(height);
  })();

  window.ondevicemotion = function(event) {
      accX = Math.round(event.accelerationIncludingGravity.x*10) / 10;
      accY = Math.round(event.accelerationIncludingGravity.y*10) / 10;

      movement = 10;

      xA = -(accX / 10) * movement;
      yA = -(accY / 10) * movement;

      getPos()
  }

} else {

  $('.content').show();

  $('#container').addClass('fullscreen');
}

//Preload the images so that we don't have to load them everytime we switch
function preload(arrayOfImages) {
    $(arrayOfImages).each(function () {
        $('<img />').attr('src',this).appendTo('body').css('display','none');
    });
    changeRunning(1);
}
// function changeGender(){
//   if(gender === "boy"){
//     gender = "girl";
//     document.getElementById("genderButton").innerText = "Change to Boy";
//   }
//   else{
//     gender = "boy";
//     document.getElementById("genderButton").innerText = "Change to Girl";
//   }
// }
function mkPreload(){
  var folders = ["down", "downer", "up", "upper", "neutral"];
  var names = ["N", "L", "LL", "LLL", "R", "RR", "RRR"];
  var images = [];
  var paths = [];
  for(var i = 0; i < names.length; i++){
    images.push(names[i]+"1.png");
    images.push(names[i]+"2.png");
    images.push(names[i]+"3.png");
    images.push(names[i]+"4.png");
  }
  console.log(images);
  for(var  j = 0; j < folders.length; j++){
    for (var i = 0; i < names.length; i++){
      paths.push("icons/boy/" + folders[j] + "/" + images[i]);
      paths.push("icons/girl/" + folders[j] + "/" + images[i]);
    }
  }
  console.log(paths);
  preload(paths);
}

function changeRunning(n)
{
  //1 = normal, 2 = talking, 3 = thinking, 4 = processing
  st = n;
}
function talking(duration){
  var open = window.setInterval(changeRunning(2), 250);
  var close = window.setInterval(changeRunning(1), 1000);
  window.setTimeout(function(){
  	window.clearInterval(open);
  	window.clearInterval(close);
    changeRunning(1);
  }, (duration * 1000));
}
function vertical()
{
	//upper
	if(yA <= -7){
		return "upper"
	}
	//up
	else if(yA <= -3.5){
		return "up";
	}
	//down
  else if(yA >= 7){
    return "downer";
  }
	else if(yA >= 3.5){
		return "down";
	}
	//neutral
	else{
		return "neutral";
	}
}
function horizontal()
{
	//left
  if(xA <= -7.5){
    return "RRR";
  }
  else if(xA <= -5.5){
    return "RR";
  }
	else if(xA <= -3.5){
		return "R";
	}
	//right
	else if(xA >= 7.5){
		return "LLL";
	}
  else if(xA >= 5.5){
    return "LL";
  }
  else if(xA >= 3.5){
    return "L";
  }
	//normal
	else{
		return "N";
	}
}
function getPos()
{
	var path = "";
	path = "./icons/" + gender + "/" + vertical() + "/" + horizontal() + this.st + ".png";
  console.log(path);
	// path = icons/[upper, up, down, normal]/[l, r, n][1, 2, 3].png where 1 = normal, 2 = talking, 3 = thinking
	$('#container').css({'background-image':'url('+ path +')'});
}

app.initialize();

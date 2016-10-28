var $ = document.querySelector.bind(document);

var recordButton = $('#record');

recordButton.addEventListener('click', recordVideo);

var mediaRecorder;
var recording = false;
navigator.getUserMedia({
  audio: true,
  video: true
}, onGetMedia, alert);

function onGetMedia(stream) {
  window.stream = stream;
  if (window.URL) {
    $('#camera').src = window.URL.createObjectURL(stream);
  } else {
    $('#camera').src = stream;
  }
}

function stopRecording() {
  recording = false;
  recordButton.textContent = 'Record';
  mediaRecorder.stop();

  var vid = document.createElement('a');
  vid.download = 'vid.webm';
  var v = document.createElement('video');
  vid.appendChild(v);
  v.loop = true;
  v.src = vid.href = window.URL.createObjectURL(new Blob(recordedBlobs, {type: 'video/webm'}));
  $('#videos').appendChild(vid);
  v.play();
}

function recordVideo() {
  if (recording === true) {
    return stopRecording();
  }

  recordButton.textContent = 'Stop Recording';
  recording = true;
  var options = {mimeType: 'video/webm', bitsPerSecond: 100000};
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    try {
      options = {mimeType: 'video/webm,codecs=vp9', bitsPerSecond: 100000};
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1);
      try {
        options = 'video/vp8'; // Chrome 47
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e2) {
        alert('MediaRecorder is not supported by this browser.\n\n' +
            'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
        console.error('Exception while creating MediaRecorder:', e2);
        return;
      }
    }
  }

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

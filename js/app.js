(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(_ => {
      console.log('service worker is all cool 🐳');
    }).catch(e => {
      console.error('service worker is not so cool 🔥', e);
      throw e;
    });


    if (navigator.serviceWorker.controller) {
      // Correctly prompt the user to reload during SW phase change.
      navigator.serviceWorker.controller.onstatechange = e => {
        if (e.target.state === 'redundant') {
          document.querySelector('#reload-prompt').style.visibility = 'visible';
        }
      }
    }
  }

  const $ = document.querySelector.bind(document);
  const recordButton = $('#record');
  const camera = $('#camera');
  const videoList = $('#videos');
  let mediaRecorder;
  let recording = false;

  recordButton.addEventListener('click', recordVideo);

  navigator.getUserMedia({
    audio: true,
    video: true
  }, onGetMedia, alert);

  function onGetMedia(stream) {
    window.stream = stream;
    if (window.URL) {
      camera.src = window.URL.createObjectURL(stream);
    } else {
      camera.src = stream;
    }
  }

  function stopRecording() {
    recording = false;
    recordButton.classList.toggle('recording');
    recordButton.textContent = 'Record';
    mediaRecorder.stop();

    let videoLink = document.createElement('a');
    videoLink.download = 'vid.webm';
    let videoElm = document.createElement('video');
    videoLink.appendChild(videoElm);
    videoElm.loop = true;
    videoElm.src = videoLink.href = window.URL.createObjectURL(
      new Blob(recordedBlobs, {type: 'video/webm'}));
    videoList.appendChild(videoElm);
    videoElm.play();
  }

  function recordVideo() {
    if (recording === true) {
      return stopRecording();
    }

    recordButton.textContent = 'Stop Recording';
    recordButton.classList.toggle('recording');
    recording = true;
    recordedBlobs = [];

    const options = {mimeType: 'video/webm', bitsPerSecond: 90000};
    try {
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e0) {
      console.log('Unable to create MediaRecorder with options Object: ', e0);
      try {
        options = {mimeType: 'video/webm,codecs=vp9', bitsPerSecond: 90000};
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e1) {
        console.log('Unable to create MediaRecorder with options Object: ', e1);
        try {
          options = 'video/vp8'; // Chrome 47
          mediaRecorder = new MediaRecorder(window.stream, options);
        } catch (e2) {
          alert('MediaRecorder is not supported by this browser.\n\n' +
              'Try Firefox 29 or later, or Chrome 47 or later, with Enable ' +
              'experimental Web Platform features enabled from chrome://flags.');
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
})();

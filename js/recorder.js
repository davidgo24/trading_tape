let mediaRecorder;
let recordedChunks = [];


//setting the stage by creating variables for the preview and buttons

const preview = document.getElementById('preview');
const webcamPreview = document.getElementById('webcamPreview');
const screenOnlyBtn = document.getElementById('screenOnlyBtn');
const screenWebcamBtn = document.getElementById('screenWebcamBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');

//adding event listeners for the buttons

screenOnlyBtn.addEventListener('click', () => startRecording(false));
screenWebcamBtn.addEventListener('click', () => startRecording(true));
stopBtn.addEventListener('click', stopRecording);
downloadBtn.addEventListener('click', downloadRecording)


//creating the startRecording functionality and setting the variables accordingly 

async function startRecording(withWebcam) {
    screenOnlyBtn.disabled = true;
    screenWebcamBtn.disabled = true;
    stopBtn.disabled = false; 
    downloadBtn.disabled = true; 
    recordedChunks = []; //empty array for recorded chunks

    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        let combinedStream = screenStream; //creating the ability to combine webcam & screen footage

        if (withWebcam) {
            try {
                const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                //live webcam preview
                webcamPreview.srcObject = webcamStream;
                webcamPreview.style.display = 'block';

                combinedStream = new MediaStream([
                    ...screenStream.getVideoTracks(),
                    ...webcamStream.getVideoTracks(),
                    ...webcamStream.getAudioTracks()
                ]);
            } catch (webcamError) {
                alert('Webcam not available. Recording screen + mic only.');
            }
        }
    
        preview.srcObject = combinedStream;
        mediaRecorder = new MediaRecorder(combinedStream);


        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.start();
    } catch (err) {
        console.error('Error starting recording:', err);
        alert('Could not start recording. Please check permissions.')
        screenOnlyBtn.disabled = false;
        screenWebcamBtn.disabled = false;
        stopBtn.disabled = true;
    }

}

function stopRecording() {
    mediaRecorder.stop();
    stopBtn.disabled = true;
    downloadBtn.disabled = false; // we want to allow user to download if they want

    //hide webcam preview after recording ends
    webcamPreview.style.display = 'None';
}

function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading-session.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}


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
    webcamPreview.style.display = 'none';
    
    // fully stop the webcam stream once we stop the recording
    const livePreview = document.getElementById('liveWebcamPreview');
    if (livePreview && livePreview.srcObject) {
        livePreview.srcObject.getTracks().forEach(track => track.stop());
        livePreview.srcObject = null;
    }

    //also stop the recording webcam preview if it had its own stream
    const recordingPreview = document.getElementById('webcamPreview');
    if (recordingPreview && recordingPreview.srcObject){
        recordingPreview.srcObject.getTracks().forEach(track => track.stop());
        livePreview.srcObject = null;
    }
}

function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    //adding unique filename for every recording - left as is to create different file types with same name
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const timeStr = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const baseFilename = `trading-session-${dateStr}-${timeStr}`;

    a.href = url;
    a.download = `${baseFilename}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);

    //prompt user for metadata

    const title = window.prompt('Enter session title:', '4H Candlestick #4 pre-market to market open 30 (3-7AM PST)');
    const strategy = window.prompt('Enter strategy focus:', 'pre-market head and shoulder break off of tapering channel with momentum at open');

    if (title && strategy) {
        const metadata = {
            title: title,
            strategy: strategy,
            date: dateStr,
            tags: [] //tags will be added later during replay phase
        };

        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const metadataUrl = URL.createObjectURL(metadataBlob);
        const metadataLink = document.createElement('a');
        metadataLink.href = metadataUrl;
        metadataLink.download = `${baseFilename}.json`;
        document.body.appendChild(metadataLink);
        metadataLink.click();
        setTimeout(() => {
            document.body.removeChild(metadataLink);
            window.URL.revokeObjectURL(metadataUrl);
        }, 100);

    }
}
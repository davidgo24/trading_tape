async function startWebcamLivePreview() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio: false});
        const livePreview = document.getElementById('liveWebcamPreview');
        livePreview.srcObject = stream;
    } catch (err) {
        console.error('Error accessing webcam for live preview:', err);
    }
}

//start live webcam preview upon going to the record page
startWebcamLivePreview();
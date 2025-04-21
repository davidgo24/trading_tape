const metadataInput = document.getElementById('metadataInput');
const videoInput = document.getElementById('videoInput');
const sessionDetails = document.getElementById('sessionDetails');
const replayVideo = document.getElementById('replayVideo');

let metadataLoaded = false;
let videoLoaded = false;

metadataInput.addEventListener('change', handleMetadataUpload);
videoInput.addEventListener('change', handleVideoUpload);

function handleMetadataUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const metadata = JSON.parse(e.target.result);

        sessionDetails.innerHTML = `
            <strong>Title:</strong> ${metadata.title}<br>
            <strong>Strategy:</strong> ${metadata.strategy}<br>
            <strong>Date:</strong> ${metadata.date}
        `;

        metadataLoaded = true;
        checkReadyToReplay();
    };

    reader.readAsText(file);
}

function handleVideoUpload(event) {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);

    replayVideo.src = url;
    videoLoaded = true;
    checkReadyToReplay();

}

function checkReadyToReplay() {
    if (metadataLoaded && videoLoaded){
        replayVideo.style.display = 'block';
    }
}

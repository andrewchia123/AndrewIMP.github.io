// State point synchronization across pages
if (localStorage.getItem('goFamPoints') === null) {
    localStorage.setItem('goFamPoints', 1250);
}

document.addEventListener("DOMContentLoaded", () => {
    updatePointsUI();
    
    // 1. INITIALIZE MAP (Only if on index.html)
    if (document.getElementById('live-map')) {
        initSingaporeMap();
    }

    // 2. INITIALIZE CAMERA SCANNER (Only if on scan.html)
    if (document.getElementById('interactive-reader')) {
        startLiveCameraScanner();
    }
});

function updatePointsUI() {
    const pointsElement = document.getElementById('total-points');
    if (pointsElement) {
        let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
        pointsElement.innerText = currentPoints.toLocaleString();
    }
}

// Map Engine Configuration
function initSingaporeMap() {
    // Centered around central Singapore area
    const map = L.map('live-map', {
        zoomControl: false 
    }).setView([1.2980, 103.8475], 13);

    // Load clean map styling templates
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: 'OpenStreetMap'
    }).addTo(map);

    // Custom stylization icons for family landmarks
    const customIcon = L.divIcon({
        className: 'custom-map-flag',
        html: '<div class="map-flag-inner"><i class="fas fa-flag"></i></div>',
        iconSize: [40, 40]
    });

    // Marker 1: Fort Canning Park
    const marker1 = L.marker([1.2942, 103.8463], {icon: customIcon}).addTo(map);
    marker1.on('click', () => {
        triggerQuest("Fort Canning Park Mystery");
    });

    // Marker 2: Singapore Botanic Gardens
    const marker2 = L.marker([1.3138, 103.8159], {icon: customIcon}).addTo(map);
    marker2.on('click', () => {
        triggerQuest("Singapore Botanic Gardens Quest");
    });
}

// Camera Scanning Engine Configuration
let html5QrcodeScanner;

function startLiveCameraScanner() {
    html5QrcodeScanner = new Html5Qrcode("interactive-reader");
    
    const config = { 
        fps: 10, 
        qrbox: { width: 180, height: 180 },
        aspectRatio: 1.0
    };

    // Requests camera hardware components
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Prioritizes back phone camera
        config,
        onQrCodeSuccess,
        onQrCodeError
    ).catch(err => {
        console.log("Camera access blocked or running on an unhosted local file profile: ", err);
    });
}

function onQrCodeSuccess(decodedText, decodedResult) {
    // Stops camera once a code is parsed to prevent looping lag
    html5QrcodeScanner.stop().then(() => {
        let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
        currentPoints += 250;
        localStorage.setItem('goFamPoints', currentPoints);
        updatePointsUI();

        showAlert("QR Code Verified! 🇸🇬", `Awesome find! Your family successfully discovered: "${decodedText}". You earned +250 points and a rare location badge!`);
    });
}

function onQrCodeError(errorMessage) {
    // Keep scanning until match found, logs errors silently
}

// Fallback Demo Simulators
function simulateQRScan() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().catch(() => {});
    }
    let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
    currentPoints += 250;
    localStorage.setItem('goFamPoints', currentPoints);
    updatePointsUI();

    showAlert("QR Code Scanned!", "Success! You scanned the simulated Fort Canning Park plaque. Your family unlocked the 'Heritage Tree' badge and gained +250 points!");
}

function triggerQuest(locationName) {
    showAlert("Quest Found! 🇸🇬", `Your family is near ${locationName}. Track down the stylized physical QR code hidden along the trail to unlock the neighborhood mystery chapter!`);
}

function claimReward(cost, rewardName) {
    let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
    if (currentPoints >= cost) {
        currentPoints -= cost;
        localStorage.setItem('goFamPoints', currentPoints);
        updatePointsUI();
        showAlert("Reward Claimed!", `Success! Your digital voucher for ${rewardName} has been generated.`);
    } else {
        showAlert("Insufficient Points", "Complete more park quests to collect points!");
    }
}

function showAlert(title, message) {
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-msg').innerText = message;
    document.getElementById('custom-alert').classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

function closeAlertAndRedirect(targetUrl) {
    document.getElementById('custom-alert').classList.add('hidden');
    window.location.href = targetUrl;
}
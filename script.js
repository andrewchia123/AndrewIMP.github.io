// State point synchronization across pages
if (localStorage.getItem('goFamPoints') === null) {
    localStorage.setItem('goFamPoints', 1250);
}

document.addEventListener("DOMContentLoaded", () => {
    updatePointsUI();
    
    // 1. INITIALIZE MAP (Only if on index.html)
    if (document.getElementById('live-map')) {
        initBishanAMKMap();
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

// Immersive Bishan-Ang Mo Kio Park Mapping Configuration
function initBishanAMKMap() {
    // Centered coordinates right over the Bishan-AMK Park River Plains section
    const parkCenter = [1.3625, 103.8465];
    
    const map = L.map('live-map', {
        zoomControl: false 
    }).setView(parkCenter, 16); // Zoomed in closer for trail walk simulation

    // Load clean map styling templates
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: 'OpenStreetMap'
    }).addTo(map);

    // --- ICON STYLES ---
    
    // 1. User Location Pin Icon (Blue Pulse Glow)
    const userIcon = L.divIcon({
        className: 'custom-map-user',
        html: '<div class="map-user-inner"><i class="fas fa-circle"></i></div>',
        iconSize: [30, 30]
    });

    // 2. QR Code Plaque Location Icon (Teal Color)
    const qrIcon = L.divIcon({
        className: 'custom-map-qr',
        html: '<div class="map-qr-inner"><i class="fas fa-qrcode"></i></div>',
        iconSize: [40, 40]
    });

    // 3. Activity / Quest Flag Icon (Coral Color)
    const activityIcon = L.divIcon({
        className: 'custom-map-flag',
        html: '<div class="map-flag-inner"><i class="fas fa-flag"></i></div>',
        iconSize: [40, 40]
    });


    // --- PLACING MARKERS ---

    // Marker A: User Current Simulated Position (Near the River Plains Bridge)
    L.marker([1.3622, 103.8460], {icon: userIcon}).addTo(map)
     .bindPopup("<b>Your Family</b><br>Currently walking along the river stream.", {closeButton: false}).openPopup();

    // Marker B: Hidden Physical QR Code Plaque (Near the Pond Gardens)
    const qrMarker = L.marker([1.3632, 103.8445], {icon: qrIcon}).addTo(map);
    qrMarker.on('click', () => {
        showQuestAlert(
            "QR Plaque Spotted! 🔍", 
            "You found the 'River Eco-System' plaque hidden near the banks! Head over to the **Scan Screen** to turn on your camera and scan the code to unlock +250 points."
        );
    });

    // Marker C: Activity Quest 1 - Water Playground
    const activity1 = L.marker([1.3615, 103.8482], {icon: activityIcon}).addTo(map);
    activity1.on('click', () => {
        showQuestAlert(
            "Family Mission: Water Works 💦", 
            "Mission: Work together to count the total number of water sluice gates at the park's specialized Water Playground. Success unlocks the 'River Wanderer' badge!"
        );
    });

    // Marker D: Activity Quest 2 - Recycle Hill Viewpoint
    const activity2 = L.marker([1.3635, 103.8472], {icon: activityIcon}).addTo(map);
    activity2.on('click', () => {
        showQuestAlert(
            "Family Mission: Summit Snapshot 📸", 
            "Mission: Head up to the top of Recycle Hill next to the 'Anish Kapoor' sculpture. Take a group family selfie with the landscape valley background to log this memory!"
        );
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

    html5QrcodeScanner.start(
        { facingMode: "environment" }, 
        config,
        onQrCodeSuccess,
        onQrCodeError
    ).catch(err => {
        console.log("Camera access blocked or running on standard unsecure local profiles: ", err);
    });
}

function onQrCodeSuccess(decodedText, decodedResult) {
    html5QrcodeScanner.stop().then(() => {
        let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
        currentPoints += 250;
        localStorage.setItem('goFamPoints', currentPoints);
        updatePointsUI();

        showQuestAlert("QR Code Verified! 🇸🇬", `Awesome discover! You scanned the Bishan-AMK Park plaque: "${decodedText}". Your family earned +250 points!`);
    });
}

function onQrCodeError(errorMessage) {}

// Fallback Demo Simulators
function simulateQRScan() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().catch(() => {});
    }
    let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
    currentPoints += 250;
    localStorage.setItem('goFamPoints', currentPoints);
    updatePointsUI();

    showQuestAlert("QR Code Scanned!", "Success! You scanned the simulated Bishan-AMK River Plaque. Your family unlocked the 'River Wanderer' badge and gained +250 points!");
}

function showQuestAlert(title, message) {
    document.getElementById('alert-title').innerHTML = title;
    document.getElementById('alert-msg').innerHTML = message;
    document.getElementById('custom-alert').classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

function closeAlertAndRedirect(targetUrl) {
    document.getElementById('custom-alert').classList.add('hidden');
    window.location.href = targetUrl;
}

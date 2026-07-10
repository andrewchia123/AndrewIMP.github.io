// State synchronization across pages
if (localStorage.getItem('goFamPoints') === null) {
    localStorage.setItem('goFamPoints', 1250);
}
if (localStorage.getItem('riverWandererUnlocked') === null) {
    localStorage.setItem('riverWandererUnlocked', 'false');
}

// CRITICAL: This ensures your mobile screen updates every time you open a page!
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

    // 3. INITIALIZE BADGES VISUALS (Only if on badges.html)
    if (document.getElementById('river-wanderer-card')) {
        updateBadgesUI();
    }
});

function updatePointsUI() {
    const pointsElement = document.getElementById('total-points');
    if (pointsElement) {
        let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
        pointsElement.innerText = currentPoints.toLocaleString();
    }
}

// Update Badges locked/earned states based on storage
function updateBadgesUI() {
    const isUnlocked = localStorage.getItem('riverWandererUnlocked') === 'true';
    const badgeCard = document.getElementById('river-wanderer-card');
    
    if (badgeCard) {
        if (isUnlocked) {
            badgeCard.classList.remove('locked');
            badgeCard.classList.add('earned');
        } else {
            badgeCard.classList.remove('earned');
            badgeCard.classList.add('locked');
        }
    }
}

// Bishan-Ang Mo Kio Park Map Logic
function initBishanAMKMap() {
    const parkCenter = [1.3625, 103.8465];
    const map = L.map('live-map', { zoomControl: false }).setView(parkCenter, 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: 'OpenStreetMap'
    }).addTo(map);

    const userIcon = L.divIcon({
        className: 'custom-map-user',
        html: '<div class="map-user-inner"><i class="fas fa-circle"></i></div>',
        iconSize: [30, 30]
    });

    const qrIcon = L.divIcon({
        className: 'custom-map-qr',
        html: '<div class="map-qr-inner"><i class="fas fa-qrcode"></i></div>',
        iconSize: [40, 40]
    });

    const activityIcon = L.divIcon({
        className: 'custom-map-flag',
        html: '<div class="map-flag-inner"><i class="fas fa-flag"></i></div>',
        iconSize: [40, 40]
    });

    L.marker([1.3622, 103.8460], {icon: userIcon}).addTo(map)
     .bindPopup("<b>Your Family</b><br>Walking along the river stream.", {closeButton: false}).openPopup();

    const qrMarker = L.marker([1.3632, 103.8445], {icon: qrIcon}).addTo(map);
    qrMarker.on('click', () => {
        showQuestAlert("QR Plaque Spotted! 🔍", "You found the 'River Eco-System' plaque! Head to the **Scan Screen** to scan it and unlock +250 points and a new badge.");
    });

    const activity1 = L.marker([1.3615, 103.8482], {icon: activityIcon}).addTo(map);
    activity1.on('click', () => {
        showQuestAlert("Family Mission: Water Works 💦", "Mission: Work together to count the water sluice gates at the Water Playground to earn points!");
    });
}

// Camera Scanning Logic
let html5QrcodeScanner;
function startLiveCameraScanner() {
    html5QrcodeScanner = new Html5Qrcode("interactive-reader");
    const config = { fps: 10, qrbox: { width: 180, height: 180 }, aspectRatio: 1.0 };

    html5QrcodeScanner.start(
        { facingMode: "environment" }, 
        config,
        onQrCodeSuccess,
        (err) => {}
    ).catch(err => {
        console.log("Camera access blocked: ", err);
    });
}

function onQrCodeSuccess(decodedText, decodedResult) {
    html5QrcodeScanner.stop().then(() => {
        executeUnlockSequence();
    });
}

// Demo Button Logic
function simulateQRScan() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().catch(() => {});
    }
    executeUnlockSequence();
}

// Shared unlock actions for both real scan and demo button
function executeUnlockSequence() {
    let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
    currentPoints += 250;
    
    localStorage.setItem('goFamPoints', currentPoints);
    localStorage.setItem('riverWandererUnlocked', 'true'); // Save badge status to storage
    updatePointsUI();

    // Changed button action to redirect straight to badges page so you can see it unlock!
    document.getElementById('custom-alert').innerHTML = `
        <div class="alert-content">
            <h3 id="alert-title">QR Code Verified! 🇸🇬</h3>
            <p id="alert-msg">Success! You scanned the Bishan-AMK River Plaque.<br><br>🎁 **+250 Points Added**<br>🏅 **'River Wanderer' Badge Unlocked!**</p>
            <button onclick="window.location.href='badges.html'">View Badges</button>
        </div>
    `;
    document.getElementById('custom-alert').classList.remove('hidden');
}

// Dynamic Reward Claiming Mechanics
function claimReward(cost, rewardName) {
    let currentPoints = parseInt(localStorage.getItem('goFamPoints'));
    
    if (currentPoints >= cost) {
        currentPoints -= cost;
        localStorage.setItem('goFamPoints', currentPoints);
        updatePointsUI(); // Updates top bar point numbers immediately
        showQuestAlert("Reward Claimed! 🎉", `Success! Your digital voucher for **${rewardName}** has been generated. Enjoy your family reward!`);
    } else {
        showQuestAlert("Not Enough Points 🚫", `You need **${cost} points** to claim the ${rewardName}. Keep exploring Bishan-AMK Park to earn more points!`);
    }
}

function showQuestAlert(title, message) {
    document.getElementById('alert-title').innerHTML = title;
    document.getElementById('alert-msg').innerHTML = message;
    document.getElementById('custom-alert').classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

// ==========================================
// MAHADEV REAL ESTATE - INTERACTIVE LOGIC (CMS & FIREBASE SYNC)
// ==========================================

// --- FIREBASE CONFIGURATION ---
// Paste your Firebase Config below to enable real-time cloud synchronization.
// If apiKey is empty/placeholder, the app will fall back to local localStorage.
const firebaseConfig = {
    apiKey: "AIzaSyCwpGz5WAc9WXWcn5Wz3fmXam87Dxbyf88",
    authDomain: "mahadev-real-estate.firebaseapp.com",
    projectId: "mahadev-real-estate",
    storageBucket: "mahadev-real-estate.firebasestorage.app",
    messagingSenderId: "226410383769",
    appId: "1:226410383769:web:9cf0ff12dbb34a1d9deb08"
};

let db = null;
let useFirebase = false;

// Global real-time arrays for Firestore data cache
let globalProperties = [];
let globalReviews = [];
let globalInquiries = [];

function initFirebase() {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            useFirebase = true;
            console.log("Firebase Firestore initialized successfully.");
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            useFirebase = false;
        }
    } else {
        console.log("Firebase not configured. Falling back to browser LocalStorage.");
    }
}

// --- DEFAULT FALLBACK DATA (If LocalStorage or Firestore is empty) ---
const DEFAULT_STATS = {
    exp: "10+",
    sold: "10+",
    happy: "99%"
};

const DEFAULT_SHOP = {
    img: "assets/shop.jpg",
    title: "Mahadev Real Estate Office",
    desc: "Strategically located in the heart of the city, our office serves as a hub of excellence. For over a decade, we have welcomed buyers, sellers, and investors, providing them with reliable market guidance, documentation assistance, and luxury property consulting.",
    address: "Shop No. 12, Mahadev Arcade, Opp. City Plaza, Sector 4, Main Road",
    hours: "Mon - Sat: 9:30 AM to 8:30 PM | Sunday: By Appointment",
    phone: "+91 99926 76777",
    email: "contact@mahadevrealestate.com",
    license: "RERA REG NO: R-887/2012",
    map: "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1243.1946254040429!2d76.63315214494723!3d28.19864032113139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1781264002004!5m2!1sen!2sin"
};

const DEFAULT_SALE_PROPERTIES = [
    {
        id: "sale-1",
        title: "Kailash Luxury Mansion",
        type: "villa",
        price: "₹3.50 Cr",
        beds: 5,
        baths: 6,
        area: "5,500 sq ft",
        address: "Sector 4, Main Road, City Centre",
        description: "An architectural marvel featuring double-height ceilings, a private infinity pool, a home theater, and gorgeous landscape design in a premium gated community.",
        image: "assets/property-sale-1.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "sale-2",
        title: "Somnath Skyline Penthouse",
        type: "apartment",
        price: "₹1.85 Cr",
        beds: 3,
        baths: 3,
        area: "2,800 sq ft",
        address: "Skyline Towers, Sector 15",
        description: "Experience sky-high luxury with panoramic city views, an wrap-around deck, integrated smart home systems, modular kitchen, and private elevator access.",
        image: "assets/property-sale-2.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "sale-3",
        title: "Shivashakti Corporate Showroom",
        type: "commercial",
        price: "₹4.20 Cr",
        beds: 0,
        baths: 2,
        area: "3,200 sq ft",
        address: "Shivashakti Arcade, Highway Junction",
        description: "High-yield corner showroom space on the main arterial road. Offers 30-foot double frontage glass facade, heavy footfall, and dedicated basement parking.",
        image: "assets/property-sale-3.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
    }
];

const DEFAULT_SOLD_PROPERTIES = [
    {
        id: "sold-1",
        title: "Nandi Meadows Estate",
        price: "₹2.95 Cr",
        category: "sold",
        type: "villa",
        beds: 4,
        baths: 4,
        area: "3,800 sq ft",
        address: "Nandi Meadows, Green Valley",
        description: "This gorgeous eco-friendly villa with solar panels and organic fruit orchards was successfully sold to a premium family within 20 days of listing.",
        image: "assets/property-sold-1.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "sold-2",
        title: "Rudraksh Business Park Suite",
        price: "₹95 Lakhs",
        category: "sold",
        type: "commercial",
        beds: 0,
        baths: 1,
        area: "1,100 sq ft",
        address: "Rudraksh IT Hub, Block C",
        description: "A plug-and-play corporate office space on the 8th floor. Handled documentation and secured buyer with a 7.5% rental yield guarantee.",
        image: "assets/property-sold-2.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80"
    }
];

// --- INITIALIZE DATA IN LOCAL STORAGE ---
function initStorage() {
    let statsData = localStorage.getItem("mahadev_stats");
    if (statsData) {
        let parsedStats = JSON.parse(statsData);
        // Migrate old default values if they are still unchanged in client's local storage
        if (parsedStats.exp === "15+" || parsedStats.sold === "500+" || parsedStats.happy === "98%") {
            if (parsedStats.exp === "15+") parsedStats.exp = DEFAULT_STATS.exp;
            if (parsedStats.sold === "500+") parsedStats.sold = DEFAULT_STATS.sold;
            if (parsedStats.happy === "98%") parsedStats.happy = DEFAULT_STATS.happy;
            localStorage.setItem("mahadev_stats", JSON.stringify(parsedStats));
        }
    } else {
        localStorage.setItem("mahadev_stats", JSON.stringify(DEFAULT_STATS));
    }
    
    let shopData = localStorage.getItem("mahadev_shop");
    if (shopData) {
        let parsed = JSON.parse(shopData);
        let modified = false;
        if (!parsed.phone) { parsed.phone = DEFAULT_SHOP.phone; modified = true; }
        if (!parsed.email) { parsed.email = DEFAULT_SHOP.email; modified = true; }
        if (!parsed.license) { parsed.license = DEFAULT_SHOP.license; modified = true; }
        // Migrate old default map url
        const oldMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.201416396903!2d77.216721!3d28.627221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b8d42d4d%3A0xe55685511cb0ff1a!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1718167232231!5m2!1sen!2sin";
        if (parsed.map === oldMapUrl || !parsed.map) {
            parsed.map = DEFAULT_SHOP.map;
            modified = true;
        }
        if (modified) {
            localStorage.setItem("mahadev_shop", JSON.stringify(parsed));
        }
    } else {
        localStorage.setItem("mahadev_shop", JSON.stringify(DEFAULT_SHOP));
    }

    let saleData = localStorage.getItem("mahadev_sale_properties");
    if (saleData) {
        let parsed = JSON.parse(saleData);
        let migrated = false;
        parsed.forEach(p => {
            if (!p.address) {
                if (p.id === "sale-1") p.address = "Sector 4, Main Road, City Centre";
                else if (p.id === "sale-2") p.address = "Skyline Towers, Sector 15";
                else p.address = "Shivashakti Arcade, Highway Junction";
                migrated = true;
            }
        });
        if (migrated) {
            localStorage.setItem("mahadev_sale_properties", JSON.stringify(parsed));
        }
    } else {
        localStorage.setItem("mahadev_sale_properties", JSON.stringify(DEFAULT_SALE_PROPERTIES));
    }

    let soldData = localStorage.getItem("mahadev_sold_properties");
    if (soldData) {
        let parsed = JSON.parse(soldData);
        let migrated = false;
        parsed.forEach(p => {
            if (!p.address) {
                if (p.id === "sold-1") p.address = "Nandi Meadows, Green Valley";
                else p.address = "Rudraksh IT Hub, Block C";
                migrated = true;
            }
        });
        if (migrated) {
            localStorage.setItem("mahadev_sold_properties", JSON.stringify(parsed));
        }
    } else {
        localStorage.setItem("mahadev_sold_properties", JSON.stringify(DEFAULT_SOLD_PROPERTIES));
    }

    if (!localStorage.getItem("mahadev_reviews")) {
        localStorage.setItem("mahadev_reviews", JSON.stringify([]));
    }
}

// --- APP INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    initFirebase();
    if (!useFirebase) {
        initStorage();
    }
    initApp();
});

function initApp() {
    if (useFirebase) {
        setupFirebaseListeners();
    } else {
        renderStats();
        renderShop();
        renderSaleProperties("all");
        renderSoldProperties();
        populatePropertySelect();
        renderTestimonials();
    }
    setupFilters();
    setupEnquiryForm();
    setupReviewSubmissionForm();
    setupMobileMenu();
    setupThemeToggle();
    setupOwnerPanel();
    setupDashboardTabs();
    setupCMSForms();
    setupCMSListingsManager();
    applySavedBackground();
    applySavedTheme();
}

// --- FIREBASE: REAL-TIME SYNC LISTENERS ---
function setupFirebaseListeners() {
    // 1. Stats Listener
    db.collection("stats").doc("main").onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            // Auto-migrate old default stats if they exist in Firestore
            if (data.exp === "15+" || data.sold === "500+" || data.happy === "98%") {
                const updated = { ...data };
                if (updated.exp === "15+") updated.exp = DEFAULT_STATS.exp;
                if (updated.sold === "500+") updated.sold = DEFAULT_STATS.sold;
                if (updated.happy === "98%") updated.happy = DEFAULT_STATS.happy;
                db.collection("stats").doc("main").set(updated, { merge: true })
                    .catch(err => console.error("Firestore stats auto-migration failed:", err));
            }
            renderStatsData(data);
        } else {
            // UI fallback only - do not auto-write to prevent rules/revert conflicts
            renderStatsData(DEFAULT_STATS);
        }
    }, error => console.error("Stats listener error:", error));

    // 2. Shop Info Listener
    db.collection("shop_info").doc("main").onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const oldMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.201416396903!2d77.216721!3d28.627221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b8d42d4d%3A0xe55685511cb0ff1a!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1718167232231!5m2!1sen!2sin";
            // Auto-migrate old map URL to the new one if stored in Firestore
            if (data.map === oldMapUrl || !data.map) {
                const updated = { ...data, map: DEFAULT_SHOP.map };
                db.collection("shop_info").doc("main").set(updated, { merge: true })
                    .catch(err => console.error("Firestore shop map auto-migration failed:", err));
            }
            renderShopData(data);
        } else {
            // UI fallback only - do not auto-write to prevent rules/revert conflicts
            renderShopData(DEFAULT_SHOP);
        }
    }, error => console.error("Shop info listener error:", error));

    // 3. Properties Listener
    db.collection("properties").onSnapshot((snapshot) => {
        globalProperties = [];
        snapshot.forEach(doc => {
            globalProperties.push({ id: doc.id, ...doc.data() });
        });
        
        const activeFilter = document.querySelector(".filter-btn.active")?.getAttribute("data-filter") || "all";
        renderSaleProperties(activeFilter);
        renderSoldProperties();
        populatePropertySelect();
        updateCMSListingsGridings();
        updateStatsSummaryCounts();
    }, error => console.error("Properties listener error:", error));

    // 4. Reviews Listener
    db.collection("reviews").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        globalReviews = [];
        snapshot.forEach(doc => {
            globalReviews.push({ id: doc.id, ...doc.data() });
        });
        renderTestimonials();
        updateReviewsDashboardTable();
    }, error => console.error("Reviews listener error:", error));

    // 5. Inquiries Listener
    db.collection("inquiries").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        globalInquiries = [];
        snapshot.forEach(doc => {
            globalInquiries.push({ id: doc.id, ...doc.data() });
        });
        updateInquiriesDashboardTable();
        updateStatsSummaryCounts();
    }, error => console.error("Inquiries listener error:", error));
}

// --- CMS: RENDER STATS ON HERO ---
function renderStats() {
    const stats = JSON.parse(localStorage.getItem("mahadev_stats")) || DEFAULT_STATS;
    renderStatsData(stats);
}

function renderStatsData(stats) {
    const expSpan = document.getElementById("heroStatExp");
    const soldSpan = document.getElementById("heroStatSold");
    const happySpan = document.getElementById("heroStatHappy");

    if (expSpan) expSpan.textContent = stats.exp;
    if (soldSpan) soldSpan.textContent = stats.sold;
    if (happySpan) happySpan.textContent = stats.happy;

    // Update Dashboard fields dynamically
    const expInput = document.getElementById("statExpInput");
    const soldInput = document.getElementById("statSoldInput");
    const happyInput = document.getElementById("statHappyInput");
    if (expInput && document.activeElement !== expInput) expInput.value = stats.exp;
    if (soldInput && document.activeElement !== soldInput) soldInput.value = stats.sold;
    if (happyInput && document.activeElement !== happyInput) happyInput.value = stats.happy;
}

// --- CMS: RENDER SHOP INFO, OWNER PHONE, EMAIL & LICENSE ---
function renderShop() {
    const shop = JSON.parse(localStorage.getItem("mahadev_shop")) || DEFAULT_SHOP;
    renderShopData(shop);
}

function renderShopData(shop) {
    const shopImg = document.getElementById("shopImage");
    const shopTitle = document.getElementById("shopTitleDisplay");
    const shopDesc = document.getElementById("shopDescDisplay");
    const shopAddress = document.getElementById("shopAddressDisplay");
    const shopHours = document.getElementById("shopHoursDisplay");
    const shopMap = document.getElementById("shopMapIframe");

    if (shopImg) shopImg.src = shop.img;
    if (shopTitle) shopTitle.textContent = shop.title;
    if (shopDesc) shopDesc.textContent = shop.desc;
    if (shopAddress) shopAddress.textContent = shop.address;
    if (shopHours) shopHours.textContent = shop.hours;
    if (shopMap) shopMap.src = shop.map;

    // Render Dynamic Phone Number
    const sanitizedPhone = (shop.phone || DEFAULT_SHOP.phone).replace(/\s+/g, '');
    const headerPhoneBtn = document.getElementById("headerPhoneBtn");
    const headerPhoneText = document.getElementById("headerPhoneText");
    if (headerPhoneBtn) headerPhoneBtn.href = `tel:${sanitizedPhone}`;
    if (headerPhoneText) headerPhoneText.textContent = shop.phone || DEFAULT_SHOP.phone;

    const shopPhoneLink = document.getElementById("shopPhoneLink");
    if (shopPhoneLink) {
        shopPhoneLink.href = `tel:${sanitizedPhone}`;
        shopPhoneLink.textContent = shop.phone || DEFAULT_SHOP.phone;
    }

    const connectPhoneBtn = document.getElementById("connectPhoneBtn");
    const connectPhoneText = document.getElementById("connectPhoneText");
    if (connectPhoneBtn) connectPhoneBtn.href = `tel:${sanitizedPhone}`;
    if (connectPhoneText) connectPhoneText.textContent = shop.phone || DEFAULT_SHOP.phone;

    // Render Dynamic Email Address
    const connectEmailLink = document.getElementById("connectEmailLink");
    const connectEmailText = document.getElementById("connectEmailText");
    if (connectEmailLink) connectEmailLink.href = `mailto:${shop.email || DEFAULT_SHOP.email}`;
    if (connectEmailText) connectEmailText.textContent = shop.email || DEFAULT_SHOP.email;

    // Render Dynamic License Number
    const connectLicenseText = document.getElementById("connectLicenseText");
    if (connectLicenseText) connectLicenseText.textContent = shop.license || DEFAULT_SHOP.license;

    // Update Dashboard fields dynamically
    const shopPhoneInput = document.getElementById("shopPhoneInput");
    const shopEmailInput = document.getElementById("shopEmailInput");
    const shopLicenseInput = document.getElementById("shopLicenseInput");
    const shopImgInput = document.getElementById("shopImgInput");
    const shopTitleInput = document.getElementById("shopTitleInput");
    const shopDescInput = document.getElementById("shopDescInput");
    const shopAddressInput = document.getElementById("shopAddressInput");
    const shopHoursInput = document.getElementById("shopHoursInput");
    const shopMapInput = document.getElementById("shopMapInput");

    if (shopPhoneInput && document.activeElement !== shopPhoneInput) shopPhoneInput.value = shop.phone || DEFAULT_SHOP.phone;
    if (shopEmailInput && document.activeElement !== shopEmailInput) shopEmailInput.value = shop.email || DEFAULT_SHOP.email;
    if (shopLicenseInput && document.activeElement !== shopLicenseInput) shopLicenseInput.value = shop.license || DEFAULT_SHOP.license;
    if (shopImgInput && document.activeElement !== shopImgInput) shopImgInput.value = shop.img;
    if (shopTitleInput && document.activeElement !== shopTitleInput) shopTitleInput.value = shop.title;
    if (shopDescInput && document.activeElement !== shopDescInput) shopDescInput.value = shop.desc;
    if (shopAddressInput && document.activeElement !== shopAddressInput) shopAddressInput.value = shop.address;
    if (shopHoursInput && document.activeElement !== shopHoursInput) shopHoursInput.value = shop.hours;
    if (shopMapInput && document.activeElement !== shopMapInput) shopMapInput.value = shop.map;
}

// --- RENDER PROPERTIES FOR SALE ---
function renderSaleProperties(filterType) {
    const grid = document.getElementById("salePropertiesGrid");
    if (!grid) return;

    grid.innerHTML = "";
    
    let list;
    if (useFirebase) {
        list = globalProperties.filter(p => p.category === "sale");
        if (globalProperties.length === 0) {
            list = DEFAULT_SALE_PROPERTIES;
        }
    } else {
        list = JSON.parse(localStorage.getItem("mahadev_sale_properties")) || [];
    }

    const filtered = list.filter(p => filterType === "all" || p.type === filterType);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-slider-msg text-center">No properties available for sale under this type.</div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "property-card glass-panel animate-fade-in";
        card.innerHTML = `
            <div class="property-thumbnail">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='${p.fallbackImage || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'}'">
                <span class="card-badge">FOR SALE</span>
                <span class="card-price">${p.price}</span>
            </div>
            <div class="property-details">
                <span class="property-type">${p.type}</span>
                <h3>${p.title}</h3>
                <p class="property-location">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-xs text-gold">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>${p.address || 'Location Undisclosed'}</span>
                </p>
                <p class="property-desc">${p.description}</p>
                <div class="property-specs">
                    <div class="spec-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-xs text-gold">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m-3-7.25l-12 4.364M5.25 12.727V21m1.5-12.727V21m1.5-14.182V21M13.5 12.727V21m1.5-14.182V21M16.5 12.727V21" />
                        </svg>
                        <span>${p.area}</span>
                    </div>
                    ${p.beds > 0 ? `
                    <div class="spec-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-xs text-gold">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5h-1.875a6 6 0 00-3-5.25h-8.25a6 6 0 00-3 5.25H3a1.5 1.5 0 00-1.5 1.5v9a1.5 1.5 0 001.5 1.5h18a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0021 7.5zM6.75 6.75a3 3 0 011.5-2.598h7.5a3 3 0 011.5 2.598V7.5h-10.5V6.75z" />
                        </svg>
                        <span>${p.beds} Beds</span>
                    </div>
                    ` : ''}
                    ${p.baths > 0 ? `
                    <div class="spec-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-xs text-gold">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h9m-9-3h9m-9-3h9M3 19.5v-15A2.25 2.25 0 015.25 2.25h13.5A2.25 2.25 0 0121 4.5v15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 19.5z" />
                        </svg>
                        <span>${p.baths} Baths</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="property-card-actions">
                <button class="btn btn-secondary btn-block inquire-trigger" data-property="${p.title}">Inquire Property</button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll(".inquire-trigger").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const propTitle = e.currentTarget.getAttribute("data-property");
            const select = document.getElementById("propertySelect");
            const inputName = document.getElementById("clientName");
            if (select) select.value = propTitle;
            document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
            if (inputName) inputName.focus();
        });
    });
}

// --- RENDER PROPERTIES SOLD ---
function renderSoldProperties() {
    const grid = document.getElementById("soldPropertiesGrid");
    if (!grid) return;

    grid.innerHTML = "";
    
    let list;
    if (useFirebase) {
        list = globalProperties.filter(p => p.category === "sold");
        if (globalProperties.length === 0) {
            list = DEFAULT_SOLD_PROPERTIES;
        }
    } else {
        list = JSON.parse(localStorage.getItem("mahadev_sold_properties")) || [];
    }

    if (list.length === 0) {
        grid.innerHTML = `<div class="empty-slider-msg text-center" style="grid-column: 1/-1;">No sold properties listed in the archive yet.</div>`;
        return;
    }

    list.forEach(p => {
        const card = document.createElement("div");
        card.className = "property-card sold-card glass-panel animate-fade-in";
        card.innerHTML = `
            <div class="property-thumbnail">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='${p.fallbackImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}'">
                <span class="card-badge">SOLD</span>
                <span class="card-price">Sold for ${p.price}</span>
            </div>
            <div class="property-details">
                <span class="property-type">${p.type || 'Closed Deal'}</span>
                <h3>${p.title}</h3>
                <p class="property-location">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-xs text-gold">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>${p.address || 'Location Undisclosed'}</span>
                </p>
                <p class="property-desc">${p.description}</p>
                <div class="property-specs">
                    <div class="spec-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-xs text-gold">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m-3-7.25l-12 4.364M5.25 12.727V21m1.5-12.727V21m1.5-14.182V21M13.5 12.727V21m1.5-14.182V21M16.5 12.727V21" />
                        </svg>
                        <span>${p.area}</span>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- FILTER CONTROLS FOR LISTINGS ---
function setupFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterBtns.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            const filterValue = e.currentTarget.getAttribute("data-filter");
            renderSaleProperties(filterValue);
        });
    });
}

// --- POPULATE ENQUIRY SELECT DROPDOWN ---
function populatePropertySelect() {
    const select = document.getElementById("propertySelect");
    if (!select) return;

    select.innerHTML = '<option value="General Enquiry">General Enquiry</option>';
    
    let list;
    if (useFirebase) {
        list = globalProperties.filter(p => p.category === "sale");
        if (globalProperties.length === 0) {
            list = DEFAULT_SALE_PROPERTIES;
        }
    } else {
        list = JSON.parse(localStorage.getItem("mahadev_sale_properties")) || [];
    }

    list.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.title;
        opt.textContent = `${p.title} (${p.price})`;
        select.appendChild(opt);
    });
}

// --- CLIENT REVIEWS (TESTIMONIALS SLIDER) ---
let testimonialInterval;

function renderTestimonials() {
    const slider = document.getElementById("testimonialSlider");
    const dotsContainer = document.getElementById("sliderDots");
    const sliderWrapper = document.getElementById("testimonialsWrapper");
    if (!slider || !dotsContainer) return;

    slider.innerHTML = "";
    dotsContainer.innerHTML = "";

    let reviews;
    if (useFirebase) {
        reviews = globalReviews;
    } else {
        reviews = JSON.parse(localStorage.getItem("mahadev_reviews")) || [];
    }

    if (reviews.length === 0) {
        slider.innerHTML = `<div class="empty-slider-msg">No client reviews submitted yet. Use the review form below to share your experience!</div>`;
        if (sliderWrapper) {
            sliderWrapper.querySelector(".prev").style.display = "none";
            sliderWrapper.querySelector(".next").style.display = "none";
        }
        clearInterval(testimonialInterval);
        return;
    }

    if (sliderWrapper) {
        sliderWrapper.querySelector(".prev").style.display = "flex";
        sliderWrapper.querySelector(".next").style.display = "flex";
    }

    reviews.forEach(t => {
        const slide = document.createElement("div");
        slide.className = "testimonial-slide";
        const stars = "⭐".repeat(parseInt(t.rating || 5));
        slide.innerHTML = `
            <span class="quote-icon">“</span>
            <div class="text-gold" style="font-size:0.95rem; margin-top:-0.5rem; margin-bottom:0.5rem;">${stars}</div>
            <blockquote class="testimonial-text">"${t.text}"</blockquote>
            <div class="client-profile">
                <img class="client-avatar" src="${t.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}" alt="${t.name}" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'">
                <div class="client-info">
                    <strong class="client-name">${t.name}</strong>
                    <span class="client-property">${t.property}</span>
                </div>
            </div>
        `;
        slider.appendChild(slide);
    });

    const slidesCount = reviews.length;
    let currentIndex = 0;

    for (let i = 0; i < slidesCount; i++) {
        const dot = document.createElement("span");
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener("click", () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach((d, idx) => {
            if (idx === currentIndex) d.classList.add("active");
            else d.classList.remove("active");
        });
    }

    function goToSlide(index) {
        currentIndex = (index + slidesCount) % slidesCount;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }

    const prevBtn = document.getElementById("sliderPrev");
    const nextBtn = document.getElementById("sliderNext");

    if (prevBtn) prevBtn.onclick = () => goToSlide(currentIndex - 1);
    if (nextBtn) nextBtn.onclick = () => goToSlide(currentIndex + 1);

    clearInterval(testimonialInterval);
    testimonialInterval = setInterval(() => goToSlide(currentIndex + 1), 6000);
}

// Helper for client-side image resizing and compression
function resizeImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.7 quality to keep it under 15KB
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.onerror = () => callback("");
    reader.readAsDataURL(file);
}

// --- SUBMIT REVIEW FORM ---
function setupReviewSubmissionForm() {
    const form = document.getElementById("publicReviewForm");
    const success = document.getElementById("reviewSuccessMsg");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("revName").value.trim();
        const property = document.getElementById("revProperty").value.trim();
        const rating = document.getElementById("revRating").value;
        const text = document.getElementById("revText").value.trim();
        const avatarFile = document.getElementById("revAvatar").files[0];

        const proceedSubmission = (avatarBase64 = "") => {
            const newReview = { name, property, avatar: avatarBase64, rating, text };

            if (useFirebase) {
                db.collection("reviews").add({
                    ...newReview,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    console.log("Review submitted to Firestore.");
                }).catch(error => {
                    console.error("Error submitting review:", error);
                });
            } else {
                let list = JSON.parse(localStorage.getItem("mahadev_reviews")) || [];
                list.unshift(newReview);
                localStorage.setItem("mahadev_reviews", JSON.stringify(list));
                renderTestimonials();
                updateReviewsDashboardTable();
            }

            form.classList.add("hidden");
            if (success) success.classList.remove("hidden");

            setTimeout(() => {
                form.reset();
                form.classList.remove("hidden");
                if (success) success.classList.add("hidden");
            }, 5000);
        };

        if (avatarFile) {
            resizeImage(avatarFile, 150, 150, (resizedDataUrl) => {
                proceedSubmission(resizedDataUrl);
            });
        } else {
            proceedSubmission("");
        }
    });
}

// --- CLIENT ENQUIRY SUBMISSION ---
function setupEnquiryForm() {
    const form = document.getElementById("enquiryForm");
    const success = document.getElementById("formSuccessMsg");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("clientName").value.trim();
        const phone = document.getElementById("clientPhone").value.trim();
        const property = document.getElementById("propertySelect").value;
        const message = document.getElementById("clientMessage").value.trim();
        const date = new Date().toLocaleString();

        const newEnquiry = { name, phone, property, message, date };

        if (useFirebase) {
            db.collection("inquiries").add({
                ...newEnquiry,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("Enquiry submitted to Firestore.");
            }).catch(error => {
                console.error("Error submitting enquiry:", error);
            });
        } else {
            let list = JSON.parse(localStorage.getItem("mahadev_enquiries")) || [];
            list.unshift(newEnquiry);
            localStorage.setItem("mahadev_enquiries", JSON.stringify(list));
            updateInquiriesDashboardTable();
        }

        form.classList.add("hidden");
        if (success) success.classList.remove("hidden");

        setTimeout(() => {
            form.reset();
            form.classList.remove("hidden");
            if (success) success.classList.add("hidden");
        }, 5000);
    });
}

// --- NAVIGATION MENU DRAWER ---
function setupMobileMenu() {
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("navMenu");
    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== btn) {
            menu.classList.remove("active");
        }
    });
}

// --- THEME SWITCHER ---
function setupThemeToggle() {
    const btn = document.getElementById("themeToggle");
    const moon = document.getElementById("moonIcon");
    const sun = document.getElementById("sunIcon");
    if (!btn) return;

    btn.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        document.body.classList.toggle("dark-theme");

        const isLight = document.body.classList.contains("light-theme");
        localStorage.setItem("mahadev_theme", isLight ? "light" : "dark");

        if (isLight) {
            moon.classList.add("hidden");
            sun.classList.remove("hidden");
        } else {
            moon.classList.remove("hidden");
            sun.classList.add("hidden");
        }
    });
}

function applySavedTheme() {
    const saved = localStorage.getItem("mahadev_theme") || "dark";
    const moon = document.getElementById("moonIcon");
    const sun = document.getElementById("sunIcon");

    if (saved === "light") {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        if (moon) moon.classList.add("hidden");
        if (sun) sun.classList.remove("hidden");
    } else {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        if (moon) moon.classList.remove("hidden");
        if (sun) sun.classList.add("hidden");
    }
}

// --- OWNER PANEL ACCESS CONTROL ---
function setupOwnerPanel() {
    const openBtn = document.getElementById("openOwnerPanelBtn");
    const menuOpenBtn = document.getElementById("menuOwnerPanelBtn");
    const passcodeModal = document.getElementById("passcodeModal");
    const dashboardModal = document.getElementById("ownerDashboardModal");

    const closePasscode = document.getElementById("closePasscodeBtn");
    const closeDashboard = document.getElementById("closeDashboardBtn");

    const submitPasscode = document.getElementById("submitPasscodeBtn");
    const ownerPasscode = document.getElementById("ownerPasscode");
    const authErrorMsg = document.getElementById("authErrorMsg");

    const logoutBtn = document.getElementById("logoutBtn");

    const TARGET_PASSCODE = "@Naman1234";

    const handleOpenClick = () => {
        if (sessionStorage.getItem("mahadev_owner_auth") === "true") {
            showDashboard();
        } else {
            passcodeModal.classList.remove("hidden");
            ownerPasscode.value = "";
            authErrorMsg.classList.add("hidden");
            ownerPasscode.focus();
        }
    };

    if (openBtn) openBtn.addEventListener("click", handleOpenClick);
    if (menuOpenBtn) menuOpenBtn.addEventListener("click", handleOpenClick);

    closePasscode.addEventListener("click", () => passcodeModal.classList.add("hidden"));
    closeDashboard.addEventListener("click", () => dashboardModal.classList.add("hidden"));

    submitPasscode.addEventListener("click", handleAuthSubmit);
    ownerPasscode.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAuthSubmit();
    });

    function handleAuthSubmit() {
        if (ownerPasscode.value === TARGET_PASSCODE) {
            sessionStorage.setItem("mahadev_owner_auth", "true");
            passcodeModal.classList.add("hidden");
            showDashboard();
        } else {
            authErrorMsg.classList.remove("hidden");
            ownerPasscode.focus();
        }
    }

    function showDashboard() {
        dashboardModal.classList.remove("hidden");
        updateInquiriesDashboardTable();
        updateCMSEditorFields();
        updateCMSListingsGridings();
        updateReviewsDashboardTable();
        updateStatsSummaryCounts();
    }

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("mahadev_owner_auth");
        dashboardModal.classList.add("hidden");
    });

    window.addEventListener("click", (e) => {
        if (e.target === passcodeModal) passcodeModal.classList.add("hidden");
        if (e.target === dashboardModal) dashboardModal.classList.add("hidden");
    });

    const presetBtns = document.querySelectorAll(".preset-btn");
    const customBgUrl = document.getElementById("customBgUrl");
    const applyCustomBgBtn = document.getElementById("applyCustomBgBtn");
    const resetBgBtn = document.getElementById("resetBgBtn");

    presetBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const bgType = e.currentTarget.getAttribute("data-bg");
            presetBtns.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");

            if (bgType === "gradient1") {
                setBackground("linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)");
            } else if (bgType === "gradient2") {
                setBackground("linear-gradient(135deg, #090d16 0%, #111827 100%)");
            } else if (bgType === "image-luxury-villa") {
                setBackground("url('assets/hero-bg.jpg')");
            } else if (bgType === "image-dark-abstract") {
                setBackground("url('assets/dark-abstract-bg.png')");
            } else if (bgType === "image-black-gold") {
                setBackground("url('assets/black-gold-bg.png')");
            }
        });
    });

    if (applyCustomBgBtn) {
        applyCustomBgBtn.addEventListener("click", () => {
            const url = customBgUrl.value.trim();
            if (url) {
                setBackground(`url('${url}')`);
                presetBtns.forEach(b => b.classList.remove("active"));
            }
        });
    }

    if (resetBgBtn) {
        resetBgBtn.addEventListener("click", () => {
            localStorage.removeItem("mahadev_bg_custom");
            document.getElementById("dynamicBackground").style.backgroundImage = "";
            customBgUrl.value = "";
            presetBtns.forEach(b => b.classList.remove("active"));
        });
    }
}

function setBackground(styleValue) {
    localStorage.setItem("mahadev_bg_custom", styleValue);
    const wrapper = document.getElementById("dynamicBackground");
    if (wrapper) {
        wrapper.style.backgroundImage = styleValue;
        if (styleValue.startsWith("linear-gradient")) {
            wrapper.style.backgroundAttachment = "unset";
        } else {
            wrapper.style.backgroundAttachment = "fixed";
        }
    }
}

// --- OWNER PANEL: TABS NAVIGATION ---
function setupDashboardTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            tabBtns.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");

            const tabId = e.currentTarget.getAttribute("data-tab");
            const contents = document.querySelectorAll(".tab-content");
            contents.forEach(c => c.classList.add("hidden"));

            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.remove("hidden");
            }
        });
    });
}

// --- CMS: UPDATE GENERAL EDIT FIELDS IN DASHBOARD ---
function updateCMSEditorFields() {
    if (useFirebase) return; // Managed in real-time listeners for Firebase

    const stats = JSON.parse(localStorage.getItem("mahadev_stats")) || DEFAULT_STATS;
    document.getElementById("statExpInput").value = stats.exp;
    document.getElementById("statSoldInput").value = stats.sold;
    document.getElementById("statHappyInput").value = stats.happy;

    const shop = JSON.parse(localStorage.getItem("mahadev_shop")) || DEFAULT_SHOP;
    document.getElementById("shopImgInput").value = shop.img;
    document.getElementById("shopTitleInput").value = shop.title;
    document.getElementById("shopDescInput").value = shop.desc;
    document.getElementById("shopAddressInput").value = shop.address;
    document.getElementById("shopHoursInput").value = shop.hours;
    document.getElementById("shopPhoneInput").value = shop.phone || DEFAULT_SHOP.phone;
    document.getElementById("shopEmailInput").value = shop.email || DEFAULT_SHOP.email;
    document.getElementById("shopLicenseInput").value = shop.license || DEFAULT_SHOP.license;
    document.getElementById("shopMapInput").value = shop.map;
}

// --- CMS: GENERAL FORMS SUBMISSION ---
function setupCMSForms() {
    const statsForm = document.getElementById("cmsStatsForm");
    const shopForm = document.getElementById("cmsShopForm");

    if (statsForm) {
        statsForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const exp = document.getElementById("statExpInput").value.trim();
            const sold = document.getElementById("statSoldInput").value.trim();
            const happy = document.getElementById("statHappyInput").value.trim();

            const updatedStats = { exp, sold, happy };

            if (useFirebase) {
                db.collection("stats").doc("main").set(updatedStats, { merge: true }).then(() => {
                    alert("Hero Statistics saved successfully!");
                }).catch(error => {
                    console.error("Error updating stats:", error);
                    alert("Error saving statistics.");
                });
            } else {
                localStorage.setItem("mahadev_stats", JSON.stringify(updatedStats));
                renderStats();
                updateStatsSummaryCounts();
                alert("Hero Statistics saved successfully!");
            }
        });
    }

    if (shopForm) {
        shopForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const img = document.getElementById("shopImgInput").value.trim();
            const title = document.getElementById("shopTitleInput").value.trim();
            const desc = document.getElementById("shopDescInput").value.trim();
            const address = document.getElementById("shopAddressInput").value.trim();
            const hours = document.getElementById("shopHoursInput").value.trim();
            const phone = document.getElementById("shopPhoneInput").value.trim();
            const email = document.getElementById("shopEmailInput").value.trim();
            const license = document.getElementById("shopLicenseInput").value.trim();
            const map = document.getElementById("shopMapInput").value.trim();

            const updatedShop = { img, title, desc, address, hours, phone, email, license, map };

            if (useFirebase) {
                db.collection("shop_info").doc("main").set(updatedShop, { merge: true }).then(() => {
                    alert("Office details & location map updated successfully!");
                }).catch(error => {
                    console.error("Error updating shop info:", error);
                    alert("Error saving office details.");
                });
            } else {
                localStorage.setItem("mahadev_shop", JSON.stringify(updatedShop));
                renderShop();
                alert("Office details & location map updated successfully!");
            }
        });
    }
}

// --- CMS: LISTINGS MANAGER (SALE & SOLD) ---
function setupCMSListingsManager() {
    const addBtn = document.getElementById("addNewPropertyBtn");
    const cancelBtn = document.getElementById("cancelPropertyEditBtn");
    const formContainer = document.getElementById("propertyEditFormContainer");
    const form = document.getElementById("propertyEditForm");

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            document.getElementById("propertyFormTitle").textContent = "Add New Listed Property";
            form.reset();
            document.getElementById("propIdInput").value = "";
            formContainer.classList.remove("hidden");
            formContainer.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            formContainer.classList.add("hidden");
            form.reset();
        });
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const id = document.getElementById("propIdInput").value;
            const title = document.getElementById("propTitleInput").value.trim();
            const category = document.getElementById("propCategoryInput").value;
            const price = document.getElementById("propPriceInput").value.trim();
            const type = document.getElementById("propTypeInput").value;
            const image = document.getElementById("propImgUrlInput").value.trim();
            const area = document.getElementById("propAreaInput").value.trim();
            const address = document.getElementById("propAddressInput").value.trim();
            const beds = parseInt(document.getElementById("propBedsInput").value) || 0;
            const baths = parseInt(document.getElementById("propBathsInput").value) || 0;
            const description = document.getElementById("propDescInput").value.trim();

            const finalId = id || "prop-" + Date.now();
            const propertyObj = { id: finalId, title, category, price, type, image, area, address, beds, baths, description };

            if (useFirebase) {
                db.collection("properties").doc(finalId).set({
                    ...propertyObj,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).then(() => {
                    formContainer.classList.add("hidden");
                    form.reset();
                    alert("Property Listing saved successfully!");
                }).catch(error => {
                    console.error("Error saving property listing:", error);
                    alert("Error saving property listing.");
                });
            } else {
                let saleList = JSON.parse(localStorage.getItem("mahadev_sale_properties")) || [];
                let soldList = JSON.parse(localStorage.getItem("mahadev_sold_properties")) || [];

                saleList = saleList.filter(p => p.id !== propertyObj.id);
                soldList = soldList.filter(p => p.id !== propertyObj.id);

                if (category === "sale") {
                    propertyObj.category = "sale";
                    saleList.unshift(propertyObj);
                } else {
                    propertyObj.category = "sold";
                    soldList.unshift(propertyObj);
                }

                localStorage.setItem("mahadev_sale_properties", JSON.stringify(saleList));
                localStorage.setItem("mahadev_sold_properties", JSON.stringify(soldList));

                formContainer.classList.add("hidden");
                form.reset();

                renderSaleProperties("all");
                renderSoldProperties();
                populatePropertySelect();
                updateCMSListingsGridings();
                updateStatsSummaryCounts();

                alert("Property Listing saved successfully!");
            }
        });
    }
}

// Render property rows inside listings tab in dashboard
function updateCMSListingsGridings() {
    const saleCmsGrid = document.getElementById("cmsSaleListingsGrid");
    const soldCmsGrid = document.getElementById("cmsSoldListingsGrid");

    if (!saleCmsGrid || !soldCmsGrid) return;

    saleCmsGrid.innerHTML = "";
    soldCmsGrid.innerHTML = "";

    let saleList, soldList;
    if (useFirebase) {
        saleList = globalProperties.filter(p => p.category === "sale");
        soldList = globalProperties.filter(p => p.category === "sold");
        if (globalProperties.length === 0) {
            saleList = DEFAULT_SALE_PROPERTIES;
            soldList = DEFAULT_SOLD_PROPERTIES;
        }
    } else {
        saleList = JSON.parse(localStorage.getItem("mahadev_sale_properties")) || [];
        soldList = JSON.parse(localStorage.getItem("mahadev_sold_properties")) || [];
    }

    if (saleList.length === 0) {
        saleCmsGrid.innerHTML = `<p class="text-muted" style="padding:1rem;">No properties listed for sale.</p>`;
    } else {
        saleList.forEach(p => {
            const row = document.createElement("div");
            row.className = "cms-list-card";
            row.innerHTML = `
                <img src="${p.image}" alt="" onerror="this.src='https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=150&h=150&q=80'">
                <div class="cms-list-card-details">
                    <h5>${p.title}</h5>
                    <span>${p.price}</span>
                    <p><strong>Loc:</strong> ${p.address || 'Undisclosed'}</p>
                </div>
                <div class="cms-list-card-actions">
                    <button class="btn btn-secondary btn-xs edit-prop-cms" data-id="${p.id}" data-category="sale">Edit</button>
                    <button class="btn btn-danger btn-xs delete-prop-cms" data-id="${p.id}" data-category="sale">Delete</button>
                </div>
            `;
            saleCmsGrid.appendChild(row);
        });
    }

    if (soldList.length === 0) {
        soldCmsGrid.innerHTML = `<p class="text-muted" style="padding:1rem;">No sold properties in archive.</p>`;
    } else {
        soldList.forEach(p => {
            const row = document.createElement("div");
            row.className = "cms-list-card";
            row.innerHTML = `
                <img src="${p.image}" alt="" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=150&h=150&q=80'">
                <div class="cms-list-card-details">
                    <h5>${p.title}</h5>
                    <span>Sold for ${p.price}</span>
                    <p><strong>Loc:</strong> ${p.address || 'Undisclosed'}</p>
                </div>
                <div class="cms-list-card-actions">
                    <button class="btn btn-secondary btn-xs edit-prop-cms" data-id="${p.id}" data-category="sold">Edit</button>
                    <button class="btn btn-danger btn-xs delete-prop-cms" data-id="${p.id}" data-category="sold">Delete</button>
                </div>
            `;
            soldCmsGrid.appendChild(row);
        });
    }

    document.querySelectorAll(".edit-prop-cms").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            const cat = e.currentTarget.getAttribute("data-category");
            editPropertyCms(id, cat);
        });
    });

    document.querySelectorAll(".delete-prop-cms").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            const cat = e.currentTarget.getAttribute("data-category");
            if (confirm("Are you sure you want to delete this property listing?")) {
                deletePropertyCms(id, cat);
            }
        });
    });
}

function editPropertyCms(id, cat) {
    let list;
    if (useFirebase) {
        list = globalProperties;
    } else {
        list = cat === "sale" 
            ? JSON.parse(localStorage.getItem("mahadev_sale_properties")) 
            : JSON.parse(localStorage.getItem("mahadev_sold_properties"));
    }
    
    const p = list.find(item => item.id === id);
    if (!p) return;

    document.getElementById("propertyFormTitle").textContent = "Edit Property Listing Details";
    document.getElementById("propIdInput").value = p.id;
    document.getElementById("propTitleInput").value = p.title;
    document.getElementById("propCategoryInput").value = cat;
    document.getElementById("propPriceInput").value = p.price;
    document.getElementById("propTypeInput").value = p.type || "villa";
    document.getElementById("propImgUrlInput").value = p.image;
    document.getElementById("propAreaInput").value = p.area;
    document.getElementById("propAddressInput").value = p.address || "";
    document.getElementById("propBedsInput").value = p.beds || 0;
    document.getElementById("propBathsInput").value = p.baths || 0;
    document.getElementById("propDescInput").value = p.description;

    const formContainer = document.getElementById("propertyEditFormContainer");
    formContainer.classList.remove("hidden");
    formContainer.scrollIntoView({ behavior: "smooth" });
}

function deletePropertyCms(id, cat) {
    if (useFirebase) {
        db.collection("properties").doc(id).delete().then(() => {
            console.log("Listing deleted from Firestore.");
        }).catch(error => {
            console.error("Error deleting property:", error);
            alert("Error deleting listing.");
        });
    } else {
        if (cat === "sale") {
            let list = JSON.parse(localStorage.getItem("mahadev_sale_properties")) || [];
            list = list.filter(item => item.id !== id);
            localStorage.setItem("mahadev_sale_properties", JSON.stringify(list));
        } else {
            let list = JSON.parse(localStorage.getItem("mahadev_sold_properties")) || [];
            list = list.filter(item => item.id !== id);
            localStorage.setItem("mahadev_sold_properties", JSON.stringify(list));
        }

        renderSaleProperties("all");
        renderSoldProperties();
        populatePropertySelect();
        updateCMSListingsGridings();
        updateStatsSummaryCounts();
    }
}

// --- CMS: INBOX INQUIRIES LOG TABLE ---
function updateInquiriesDashboardTable() {
    const tbody = document.getElementById("inboxTableBody");
    const emptyMsg = document.getElementById("emptyInboxMsg");
    const clearInboxBtn = document.getElementById("clearInboxBtn");
    if (!tbody) return;

    let inquiries;
    if (useFirebase) {
        inquiries = globalInquiries;
    } else {
        inquiries = JSON.parse(localStorage.getItem("mahadev_enquiries")) || [];
    }

    tbody.innerHTML = "";

    if (inquiries.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove("hidden");
        return;
    }

    if (emptyMsg) emptyMsg.classList.add("hidden");

    inquiries.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.date}</strong></td>
            <td>${item.name}</td>
            <td><a href="tel:${item.phone}" class="text-gold"><strong>${item.phone}</strong></a></td>
            <td><span class="badge badge-gold">${item.property}</span></td>
            <td>${item.message}</td>
            <td>
                <button class="btn btn-danger btn-xs delete-enquiry-btn" data-index="${index}" data-id="${item.id || ''}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll(".delete-enquiry-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (useFirebase) {
                const id = e.currentTarget.getAttribute("data-id");
                db.collection("inquiries").doc(id).delete();
            } else {
                const index = parseInt(e.currentTarget.getAttribute("data-index"));
                let list = JSON.parse(localStorage.getItem("mahadev_enquiries")) || [];
                list.splice(index, 1);
                localStorage.setItem("mahadev_enquiries", JSON.stringify(list));
                updateInquiriesDashboardTable();
                updateStatsSummaryCounts();
            }
        });
    });

    if (clearInboxBtn) {
        clearInboxBtn.onclick = () => {
            if (confirm("Are you sure you want to clear all inquiries?")) {
                if (useFirebase) {
                    globalInquiries.forEach(item => {
                        db.collection("inquiries").doc(item.id).delete();
                    });
                } else {
                    localStorage.setItem("mahadev_enquiries", JSON.stringify([]));
                    updateInquiriesDashboardTable();
                    updateStatsSummaryCounts();
                }
            }
        };
    }
}

// --- CMS: REVIEWS MANAGER LOG TABLE ---
function updateReviewsDashboardTable() {
    const tbody = document.getElementById("reviewsTableBody");
    const emptyMsg = document.getElementById("emptyReviewsMsg");
    const clearReviewsBtn = document.getElementById("clearReviewsBtn");
    if (!tbody) return;

    let reviews;
    if (useFirebase) {
        reviews = globalReviews;
    } else {
        reviews = JSON.parse(localStorage.getItem("mahadev_reviews")) || [];
    }

    tbody.innerHTML = "";

    if (reviews.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove("hidden");
        return;
    }

    if (emptyMsg) emptyMsg.classList.add("hidden");

    reviews.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td>${item.property}</td>
            <td>${"⭐".repeat(parseInt(item.rating || 5))}</td>
            <td>${item.text}</td>
            <td>
                <button class="btn btn-danger btn-xs delete-review-btn" data-index="${index}" data-id="${item.id || ''}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll(".delete-review-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (useFirebase) {
                const id = e.currentTarget.getAttribute("data-id");
                db.collection("reviews").doc(id).delete();
            } else {
                const index = parseInt(e.currentTarget.getAttribute("data-index"));
                let list = JSON.parse(localStorage.getItem("mahadev_reviews")) || [];
                list.splice(index, 1);
                localStorage.setItem("mahadev_reviews", JSON.stringify(list));
                updateReviewsDashboardTable();
                renderTestimonials();
            }
        });
    });

    if (clearReviewsBtn) {
        clearReviewsBtn.onclick = () => {
            if (confirm("Are you sure you want to delete all reviews?")) {
                if (useFirebase) {
                    globalReviews.forEach(item => {
                        db.collection("reviews").doc(item.id).delete();
                    });
                } else {
                    localStorage.setItem("mahadev_reviews", JSON.stringify([]));
                    updateReviewsDashboardTable();
                    renderTestimonials();
                }
            }
        };
    }
}

// --- CMS: UPDATE GENERAL STAT COUNTERS ON DASHBOARD HEADER ---
function updateStatsSummaryCounts() {
    const totalEnquiriesCount = document.getElementById("totalEnquiriesCount");
    const saleCountDisplay = document.getElementById("saleCountDisplay");
    const soldCountDisplay = document.getElementById("soldCountDisplay");

    let inquiries, saleList, soldList;
    if (useFirebase) {
        inquiries = globalInquiries;
        saleList = globalProperties.filter(p => p.category === "sale");
        soldList = globalProperties.filter(p => p.category === "sold");
    } else {
        inquiries = JSON.parse(localStorage.getItem("mahadev_enquiries")) || [];
        saleList = JSON.parse(localStorage.getItem("mahadev_sale_properties")) || [];
        soldList = JSON.parse(localStorage.getItem("mahadev_sold_properties")) || [];
    }

    if (totalEnquiriesCount) totalEnquiriesCount.textContent = inquiries.length;
    if (saleCountDisplay) saleCountDisplay.textContent = saleList.length;
    if (soldCountDisplay) soldCountDisplay.textContent = soldList.length;
}

function applySavedBackground() {
    const savedBg = localStorage.getItem("mahadev_bg_custom");
    if (savedBg) {
        const wrapper = document.getElementById("dynamicBackground");
        if (wrapper) {
            wrapper.style.backgroundImage = savedBg;
            if (savedBg.startsWith("linear-gradient")) {
                wrapper.style.backgroundAttachment = "unset";
            }
        }
    }
}

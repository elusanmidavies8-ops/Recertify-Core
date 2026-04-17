function showError(msg) {
    alert("❌ " + msg);
}

function showSuccess(msg) {
    alert("✅ " + msg);
}

function showInfo(msg) {
    alert("ℹ️ " + msg);
}
function selectPlan(plan) {
    localStorage.setItem("plan", plan);
    window.location.href = "login.html";
}
function initDashboard() {
    const plan = localStorage.getItem("plan") || "Basic";

    // Update sidebar based on plan
    updateSidebarForPlan(plan);

    const fileSection = document.getElementById("proBatchSection");
    const batchButton = document.querySelector("#proBatchSection button");
    if (fileSection && batchButton) {
        if (plan !== "pro") {
            batchButton.textContent = "Upgrade to Pro";
            batchButton.onclick = function() { showError("Upgrade to Pro for batch minting"); };
        } else {
            batchButton.textContent = "Upload & Mint";
            batchButton.onclick = batchMint;
        }
    }
    displayCertificateHistory();

    // Initialize analytics if analytics section is active
    const activeSection = document.querySelector('.dashboard-section.active');
    if (activeSection && activeSection.id === 'analytics') {
        updateAnalytics();
    }
}

function updateSidebarForPlan(plan) {
    const memberBadge = document.getElementById("memberBadge");
    const planDisplay = document.getElementById("planDisplay");
    const planSubtitle = document.getElementById("planSubtitle");

    if (plan === "pro") {
        if (memberBadge) memberBadge.textContent = "PRO MEMBER";
        if (planDisplay) planDisplay.textContent = "Pro Tier";
        if (planSubtitle) planSubtitle.textContent = "Unlimited Batch Minting";
    } else {
        if (memberBadge) memberBadge.textContent = "BASIC MEMBER";
        if (planDisplay) planDisplay.textContent = "Basic Tier";
        if (planSubtitle) planSubtitle.textContent = "5 Certificates/Month";
    }
}

function mint() {
    const name = document.getElementById("name").value;
    const course = document.getElementById("course").value;
    const wallet = document.getElementById("wallet").value;

    if (!name || !course) {
        showError("Please fill all fields");
        return;
    }

    const plan = localStorage.getItem("plan");
    if (!plan) {
        showError("No plan selected");
        return;
    }

    // Generate certificate ID
    const certId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');

    const certificate = {
        id: certId,
        name,
        course,
        wallet: wallet || "",
        plan,
        date: new Date().toLocaleString(),
    };

    const history = getCertificateHistory();
    history.push(certificate);
    saveCertificateHistory(history);
    displayCertificateHistory();

    // Update the certificate preview
    updateCertificatePreview(certificate);

    showSuccess(`Certificate minted for ${name}! Certificate ID: #${certId}`);

    // Add download button
    addDownloadButton(certificate);

    // Clear form
    document.getElementById("name").value = "";
    document.getElementById("course").value = "";
    document.getElementById("wallet").value = "";
}

function updateCertificatePreview(certificate) {
    // Update the certificate preview with the minted certificate data
    document.querySelector('.cert-header').textContent = `CERTIFICATE ID: #${certificate.id}`;
    document.querySelector('.cert-name').textContent = certificate.name;
    document.querySelector('.cert-description').textContent = `For successfully completing the rigorous requirements of ${certificate.course}`;

    // Add a minted timestamp
    const mintedDate = new Date().toLocaleDateString();
    document.querySelector('.cert-footer').innerHTML = `
        <p>SMART CONTRACT: 0x8127cf...</p>
        <p>TOKEN STANDARD: ERC-721 Immutable</p>
        <p>MINTED: ${mintedDate}</p>
    `;

    // Highlight the preview to show it's been updated
    const preview = document.querySelector('.certificate-preview');
    preview.style.animation = 'none';
    setTimeout(() => {
        preview.style.animation = 'mintSuccess 0.5s ease-in-out';
    }, 10);
}

function addDownloadButton(certificate) {
    // Remove any existing download button
    const existingBtn = document.querySelector('.download-cert-btn');
    if (existingBtn) {
        existingBtn.remove();
    }

    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn-secondary download-cert-btn';
    downloadBtn.textContent = '📥 Download Certificate';
    downloadBtn.onclick = () => downloadCertificate(certificate);

    // Add it after the mint button
    const mintBtn = document.querySelector('.mint-btn');
    if (mintBtn && mintBtn.parentNode) {
        mintBtn.parentNode.insertBefore(downloadBtn, mintBtn.nextSibling);
    }
}

function downloadCertificate(certificate) {
    // Create a simple certificate image using HTML5 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8f9ff';
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 560);

    // Title
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RECERTIFY CORE', 400, 80);

    ctx.fillStyle = '#666';
    ctx.font = '24px Arial';
    ctx.fillText('IMMUTABLE CREDENTIAL', 400, 120);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Certificate of Achievement', 400, 180);

    // Certificate ID
    ctx.fillStyle = '#7c3aed';
    ctx.font = '18px Arial';
    ctx.fillText(`Certificate ID: #${certificate.id}`, 400, 230);

    // Presented to
    ctx.fillStyle = '#666';
    ctx.font = '20px Arial';
    ctx.fillText('PRESENTED TO', 400, 280);

    // Name
    ctx.fillStyle = '#333';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(certificate.name, 400, 320);

    // Course
    ctx.fillStyle = '#666';
    ctx.font = '18px Arial';
    ctx.fillText(`For successfully completing the rigorous requirements of`, 400, 370);
    ctx.fillText(certificate.course, 400, 400);

    // Date
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.fillText(`Minted: ${new Date(certificate.date).toLocaleDateString()}`, 400, 450);

    // Footer
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.fillText('SMART CONTRACT: 0x8127cf... | TOKEN STANDARD: ERC-721 Immutable', 400, 520);

    // Convert to blob and download
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate_${certificate.name.replace(/\s+/g, '_')}_${certificate.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess('Certificate downloaded successfully!');
    });
}

function batchMint() {
    const plan = localStorage.getItem("plan");

    if (plan !== "pro") {
        showError("Upgrade to Pro for batch minting");
        return;
    }
    const fileInput = document.getElementById("file");
    const file = fileInput?.files?.[0];
    if (!file) {
        showError("Upload a file first");
        return;
    }

    showInfo("Processing file...");

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const records = parseCsv(text);
        if (!records.length) {
            showError("File is empty or invalid");
            return;
        }

        showInfo(`Processing ${records.length} certificates...`);

        // Simulate processing time
        setTimeout(() => {
            const history = getCertificateHistory();
            records.forEach(row => {
                const [name, course, wallet] = row;
                if (name && course) {
                    history.push({
                        name,
                        course,
                        wallet: wallet || "",
                        plan,
                        date: new Date().toLocaleString(),
                    });
                }
            });
            saveCertificateHistory(history);
            displayCertificateHistory();

            showSuccess(`${records.length} certificates minted from file!`);
        }, 2000);
    };

    reader.onerror = function() {
        showError("Failed to read file");
    };

    reader.readAsText(file);
}

function login(event) {
    if (event) event.preventDefault(); // ⛔ stop reload

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Fill all fields");
        return;
    }

    if (localStorage.getItem("plan")) {
        localStorage.setItem("plan", "basic");
    }

    localStorage.setItem("user", email);
    showSuccess("Login successful! Welcome to Recertify Core!");

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);
}

function upgrade() {
    localStorage.setItem("plan", "pro");
    alert("Upgraded to Pro Plan!");
    location.reload();
}
function exportCertificates() {
    const history = getCertificateHistory();
    if (!history.length) {
        alert("No certificates to export");
        return;
    }
    const csv = "Name,Course,Wallet,Plan,Date\n" + history.map(cert => `${cert.name},${cert.course},${cert.wallet || ""},${cert.plan},${cert.date}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificates.csv";
    a.click();
    URL.revokeObjectURL(url);
}
function importCertificates() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const records = parseCsv(text);
            const history = getCertificateHistory();
            records.forEach(row => {
                const [name, course, wallet] = row;
                if (name && course) {
                    history.push({
                        name,
                        course,
                        wallet: wallet || "",
                        plan: localStorage.getItem("plan") || "basic",
                        date: new Date().toLocaleString()
                    });
                }
            });
            saveCertificateHistory(history);
            displayCertificateHistory();
            alert("Certificates imported");
        };
        reader.readAsText(file);
    };
    input.click();
}
function getCertificateHistory() {
    const historyJson = localStorage.getItem("certificates");
    return historyJson ? JSON.parse(historyJson) : [];
}
function saveCertificateHistory(history) {
    localStorage.setItem("certificates", JSON.stringify(history));
}
function displayCertificateHistory() {
    const list = getCertificateHistory();
    const container = document.getElementById("historyList");
    if (!container) return;
    container.innerHTML = "";
    if (!list.length) {
        container.innerHTML = "<p>No certificates minted yet.</p>";
        return;
    }
    list.slice().reverse().forEach(cert => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `<p><strong>${cert.name}</strong> - ${cert.course}</p><p>${cert.wallet ? cert.wallet : "No wallet address"}</p><p class="history-date">${cert.date}</p>`;
        container.appendChild(item);
    });
}
function updateAnalytics() {
    const history = getCertificateHistory();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Calculate metrics
    const totalCertificates = history.length;
    const monthlyCertificates = history.filter(cert => {
        const certDate = new Date(cert.date);
        return certDate.getMonth() === thisMonth && certDate.getFullYear() === thisYear;
    }).length;

    // Calculate growth (compare with last month)
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthCertificates = history.filter(cert => {
        const certDate = new Date(cert.date);
        return certDate.getMonth() === lastMonth && certDate.getFullYear() === lastMonthYear;
    }).length;

    const growth = lastMonthCertificates > 0 ?
        ((monthlyCertificates - lastMonthCertificates) / lastMonthCertificates * 100).toFixed(1) :
        (monthlyCertificates > 0 ? "+100.0" : "0.0");

    // Calculate average confirmation time (simulated)
    const avgTime = (Math.random() * 0.5 + 0.5).toFixed(1); // 0.5-1.0 seconds

    // Update the UI
    const totalEl = document.querySelector('.metric-number');
    const growthEl = document.querySelector('.metric-growth');
    const timeEl = document.querySelectorAll('.metric-number')[1];

    if (totalEl) totalEl.textContent = totalCertificates.toLocaleString();
    if (growthEl) growthEl.textContent = `${growth > 0 ? '+' : ''}${growth}%`;
    if (timeEl) timeEl.textContent = `${avgTime}s`;

    // Update activity heatmap (simplified - just show recent activity)
    updateActivityHeatmap(history);
}

function updateActivityHeatmap(history) {
    const cells = document.querySelectorAll('.heatmap-cell');
    const now = new Date();

    cells.forEach((cell, index) => {
        const daysAgo = 9 - index; // Last 10 days
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - daysAgo);

        const dayActivity = history.filter(cert => {
            const certDate = new Date(cert.date);
            return certDate.toDateString() === checkDate.toDateString();
        }).length;

        cell.className = 'heatmap-cell';
        if (dayActivity > 0) {
            cell.classList.add('active');
        }
    });
}

 

/* ADDITIONAL FUNCTIONS FOR NEW PAGES */

function goToSignup() {
    alert("Sign up functionality - coming soon!");
}

function connectWallet(wallet) {
    if (wallet) {
        alert(`Connecting ${wallet.toUpperCase()}...`);
    } else {
        alert("Connect wallet - MetaMask, Phantom, Trust Wallet, or Binance");
    }
}

function loginGoogle() {
    alert("Google login - coming soon!");
}

function goToLogin() {
    window.location.href = "login.html";
}

function showSection(sectionId, event) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Update top nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // Update sidebar nav links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Find and activate the corresponding sidebar link
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    if (sectionId === 'single-mint') {
        sidebarLinks[0].classList.add('active');
        // Also activate top nav if event target exists
        if (event && event.target) {
            event.target.classList.add('active');
        }
    } else if (sectionId === 'batch-mint') {
        sidebarLinks[1].classList.add('active');
        if (event && event.target) {
            event.target.classList.add('active');
        }
    } else if (sectionId === 'analytics') {
        sidebarLinks[2].classList.add('active');
        if (event && event.target) {
            event.target.classList.add('active');
        }
        // Update analytics with real data
        updateAnalytics();
    }
}

function goToAnalytics() {
    // Analytics is now integrated into Dashboard.html
    showSection('analytics');
}

function copyAddress() {
    const address = document.getElementById("wallet").value;
    if (address) {
        navigator.clipboard.writeText(address);
        alert("Address copied to clipboard!");
    } else {
        alert("Please enter a wallet address first");
    }
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

function showInfo(message) {
    alert(message);
}

function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        showError("Please fill all fields!");
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match!");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters!");
        return;
    }

    // Check if user already exists (simple check)
    const existingUser = localStorage.getItem("user");
    if (existingUser === email) {
        showError("Account already exists! Please log in.");
        return;
    }

    // Store user data
    localStorage.setItem("user", email);
    localStorage.setItem("userName", name);
    localStorage.setItem("plan", "basic"); // Default plan

    showSuccess("🎉 Account created successfully! Welcome to Recertify Core!");
    showInfo("Redirecting to Dashboard...");

    setTimeout(() => {
        window.location.href = "Dashboard.html";
    }, 1500);
}

function signupGoogle() {
    alert("Google sign up - coming soon!");
}

function goToSignup() {
    window.location.href = "signup.html";
}

function triggerFileUpload() {
    document.getElementById("batchFile").click();
}

function handleBatchUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showInfo(`File uploaded: ${file.name}`);
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("plan");
    window.location.href = "index.html";
}

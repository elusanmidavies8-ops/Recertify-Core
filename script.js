
/* ======================
   NOTIFICATIONS
====================== */
function showError(msg) {
    alert("❌ " + msg);
}

function showSuccess(msg) {
    alert("✅ " + msg);
}

function showInfo(msg) {
    alert("ℹ️ " + msg);
}

/* ======================
   NAVIGATION
====================== */
function goToSignup() {
    window.location.href = "signup.html";
}

function goToLogin() {
    window.location.href = "login.html";
}

function goToAnalytics() {
    showSection("analytics");
}

/* ======================
   AUTH (LOGIN / SIGNUP)
====================== */
function handleLogin(event) {
    if (event) event.preventDefault();

    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        showError("Fill all fields");
        return;
    }

    // default plan safety
    if (!localStorage.getItem("plan")) {
        localStorage.setItem("plan", "basic");
    }

    localStorage.setItem("user", email);

    showSuccess("Login successful! Welcome to Recertify Core!");

    setTimeout(() => {
        window.location.href = "Dashboard.html";
    }, 1000);
}

function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

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

    localStorage.setItem("user", email);
    localStorage.setItem("userName", name);
    localStorage.setItem("plan", "basic");

    showSuccess("Account created successfully!");
    showInfo("Redirecting...");

    setTimeout(() => {
        window.location.href = "Dashboard.html";
    }, 1200);
}

/* ======================
   WALLET
====================== */
function connectWallet(wallet) {
    showInfo(`Connecting ${wallet} wallet...`);
}

function copyAddress() {
    const address = document.getElementById("wallet")?.value;

    if (!address) {
        showError("Enter wallet address first");
        return;
    }

    navigator.clipboard.writeText(address);
    showSuccess("Address copied!");
}

function loginGoogle() {
    showInfo("Google login coming soon...");
}

/* ======================
   PLAN SYSTEM
====================== */
function selectPlan(plan) {
    localStorage.setItem("plan", plan);
    window.location.href = "login.html";
}

function upgrade() {
    localStorage.setItem("plan", "pro");
    showSuccess("Upgraded to Pro!");
    location.reload();
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

/* ======================
   CERTIFICATE MINTING
====================== */
function mint() {
    const name = document.getElementById("name")?.value;
    const course = document.getElementById("course")?.value;
    const wallet = document.getElementById("wallet")?.value;

    if (!name || !course) {
        showError("Please fill all fields");
        return;
    }

    const plan = localStorage.getItem("plan") || "basic";

    const certId = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0");

    const certificate = {
        id: certId,
        name,
        course,
        wallet: wallet || "",
        plan,
        date: new Date().toISOString()
    };

    const history = getCertificateHistory();
    history.push(certificate);
    saveCertificateHistory(history);

    displayCertificateHistory();
    updateCertificatePreview(certificate);

    showSuccess(`Minted! ID #${certId}`);
    addDownloadButton(certificate);

    document.getElementById("name").value = "";
    document.getElementById("course").value = "";
    document.getElementById("wallet").value = "";
}

/* ======================
   CERTIFICATE UI
====================== */
function updateCertificatePreview(certificate) {
    const header = document.querySelector(".cert-header");
    const name = document.querySelector(".cert-name");
    const desc = document.querySelector(".cert-description");
    const footer = document.querySelector(".cert-footer");
    const preview = document.querySelector(".certificate-preview");

    if (header) header.textContent = `CERTIFICATE ID: #${certificate.id}`;
    if (name) name.textContent = certificate.name;
    if (desc) desc.textContent = `Completed ${certificate.course}`;

    if (footer) {
        footer.innerHTML = `
            <p>MINTED: ${new Date().toLocaleDateString()}</p>
            <p>ERC-721 VERIFIED</p>
        `;
    }

    if (preview) {
        preview.style.animation = "none";
        setTimeout(() => {
            preview.style.animation = "mintSuccess 0.5s ease-in-out";
        }, 10);
    }
}

function addDownloadButton(certificate) {
    document.querySelector(".download-cert-btn")?.remove();

    const btn = document.createElement("button");
    btn.className = "btn-secondary download-cert-btn";
    btn.textContent = "Download Certificate";
    btn.onclick = () => downloadCertificate(certificate);

    const mintBtn = document.querySelector(".mint-btn");
    mintBtn?.parentNode?.insertBefore(btn, mintBtn.nextSibling);
}

/* ======================
   DOWNLOAD CERT
====================== */

function downloadCertificate(cert) {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#f8f9ff";
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 560);

    // Main Title
    ctx.fillStyle = "#7c3aed";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("RECERTIFY CORE", 400, 80);

    ctx.fillStyle = "#666";
    ctx.font = "24px Arial";
    ctx.fillText("IMMUTABLE CREDENTIAL", 400, 120);

    // Certificate Title
    ctx.fillStyle = "#333";
    ctx.font = "bold 32px Arial";
    ctx.fillText("Certificate of Achievement", 400, 180);

    // Certificate ID
    ctx.fillStyle = "#7c3aed";
    ctx.font = "18px Arial";
    ctx.fillText(`Certificate ID: #${cert.id}`, 400, 230);

    // Label
    ctx.fillStyle = "#666";
    ctx.font = "20px Arial";
    ctx.fillText("PRESENTED TO", 400, 280);

    // Name
    ctx.fillStyle = "#333";
    ctx.font = "bold 28px Arial";
    ctx.fillText(cert.name, 400, 320);

    // Course text
    ctx.fillStyle = "#666";
    ctx.font = "18px Arial";
    ctx.fillText("For successfully completing the rigorous requirements of", 400, 370);
    ctx.fillText(cert.course, 400, 400);

    // Date
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    const date = cert.date ? new Date(cert.date).toLocaleDateString() : "N/A";
ctx.fillText(`Minted: ${date}`, 400, 450);
    // Footer
    ctx.fillStyle = "#999";
    ctx.font = "14px Arial";
    ctx.fillText(
        "SMART CONTRACT: 0x8127cf... | TOKEN STANDARD: ERC-721 Immutable",
        400,
        520
    );

    // Download
    canvas.toBlob(function (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificate_${cert.name.replace(/\s+/g, "_")}_${cert.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert("✅ Certificate downloaded successfully!");
    });
           }

/* ======================
   BATCH MINTING
====================== */
function batchMint() {
    const plan = localStorage.getItem("plan");

    if (plan !== "pro") {
        showError("Upgrade to Pro first");
        return;
    }

    const file = document.getElementById("file")?.files?.[0];
    if (!file) {
        showError("Upload file first");
        return;
    }

    const reader = new FileReader();

    reader.onload = e => {
        const records = parseCsv(e.target.result);

        if (!records.length) {
            showError("Invalid file");
            return;
        }

        const history = getCertificateHistory();

        records.forEach(([name, course, wallet]) => {
            if (name && course) {
                history.push({
                    name,
                    course,
                    wallet: wallet || "",
                    plan,
                    date: new Date().toISOString()
                });
            }
        });

        saveCertificateHistory(history);
        displayCertificateHistory();

        showSuccess(`${records.length} certificates minted`);
    };

    reader.readAsText(file);
}

/* ======================
   CSV PARSER
====================== */
function parseCsv(text) {
    return text
        .trim()
        .split("\n")
        .map(row => row.split(",").map(cell => cell.trim()));
}

/* ======================
   STORAGE HELPERS
====================== */
function getCertificateHistory() {
    return JSON.parse(localStorage.getItem("certificates")) || [];
}

function saveCertificateHistory(history) {
    localStorage.setItem("certificates", JSON.stringify(history));
}

/* ======================
   HISTORY UI
====================== */
function displayCertificateHistory() {
    const container = document.getElementById("historyList");
    if (!container) return;

    const list = getCertificateHistory();
    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = "<p>No certificates yet</p>";
        return;
    }

    list.slice().reverse().forEach(cert => {
        const div = document.createElement("div");
        div.className = "history-item";

        div.innerHTML = `
            <p><strong>${cert.name}</strong> - ${cert.course}</p>
            <p>${cert.wallet || "No wallet"}</p>
            <p>${new Date(cert.date).toLocaleDateString()}</p>
        `;

        container.appendChild(div);
    });
}

/* ======================
   ANALYTICS
====================== */
function updateAnalytics() {
    const history = getCertificateHistory();

    const total = history.length;

    const totalEl = document.querySelector(".metric-number");
    if (totalEl) totalEl.textContent = total;
}

/* ======================
   SECTION SWITCHING
====================== */
function showSection(id) {
    document.querySelectorAll(".dashboard-section")
        .forEach(s => s.classList.remove("active"));

    document.getElementById(id)?.classList.add("active");
}

/* ======================
   LOGOUT
====================== */
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
        }

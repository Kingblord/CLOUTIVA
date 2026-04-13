import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, increment, collection, addDoc, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

// ===================== FIREBASE =====================
const firebaseConfig = {
  apiKey: "AIzaSyDIdOyW4TfGO4K0hdOA4_drvYPZ_-FywG0",
  authDomain: "cloutiva-app.firebaseapp.com",
  projectId: "cloutiva-app",
  storageBucket: "cloutiva-app.firebasestorage.app",
  messagingSenderId: "898248697277",
  appId: "1:898248697277:web:8bcdeabc3c91618ae15ed4",
  measurementId: "G-JTCSKX7FG5"
};

const TOKENS = {
    bsc: {
        USDT: "0x55d398326f99059fF775485246999027B3197955",
        USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
    },
    eth: {
        USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        USDC: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    }
};

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ===================== CONFIG =====================
export const HERO_SMS_CONFIG = {
    rate: 1550 
};

export const FOLLOWIZ_CONFIG = {
    profitMargin: 1.80 
};

// ===================== SERVICE MAPPING SYSTEM =====================
export const SERVICE_MAP = {
    // Social Media & Messaging
    "wa": { name: "WhatsApp", icon: "fa-brands fa-whatsapp", color: "text-green-500" },
    "tg": { name: "Telegram", icon: "fa-brands fa-telegram", color: "text-blue-500" },
    "ig": { name: "Instagram", icon: "fa-brands fa-instagram", color: "text-pink-500" },
    "fb": { name: "Facebook", icon: "fa-brands fa-facebook", color: "text-blue-600" },
    "tw": { name: "Twitter", icon: "fa-brands fa-x-twitter", color: "text-gray-700" },
    "tt": { name: "TikTok", icon: "fa-brands fa-tiktok", color: "text-black" },
    "sc": { name: "Snapchat", icon: "fa-brands fa-snapchat", color: "text-yellow-500" },
    "di": { name: "Discord", icon: "fa-brands fa-discord", color: "text-indigo-500" },
    "sk": { name: "Skype", icon: "fa-brands fa-skype", color: "text-blue-400" },
    "vb": { name: "Viber", icon: "fa-solid fa-mobile-screen", color: "text-purple-500" },
    "li": { name: "LinkedIn", icon: "fa-brands fa-linkedin", color: "text-blue-700" },
    
    // Email Services
    "go": { name: "Google", icon: "fa-brands fa-google", color: "text-red-500" },
    "mi": { name: "Microsoft", icon: "fa-brands fa-microsoft", color: "text-blue-600" },
    "ya": { name: "Yahoo", icon: "fa-solid fa-envelope", color: "text-purple-600" },
    "ma": { name: "Mail.ru", icon: "fa-solid fa-envelope", color: "text-blue-500" },
    "ic": { name: "iCloud", icon: "fa-brands fa-apple", color: "text-gray-600" },
    "ou": { name: "Outlook", icon: "fa-brands fa-microsoft", color: "text-blue-600" },
    
    // Gaming & Entertainment
    "st": { name: "Steam", icon: "fa-brands fa-steam", color: "text-gray-600" },
    "ep": { name: "Epic Games", icon: "fa-solid fa-gamepad", color: "text-gray-700" },
    "ub": { name: "Uber", icon: "fa-solid fa-car", color: "text-black" },
    "ol": { name: "OLX", icon: "fa-solid fa-shopping-cart", color: "text-orange-500" },
    "am": { name: "Amazon", icon: "fa-brands fa-amazon", color: "text-orange-600" },
    "nf": { name: "Netflix", icon: "fa-brands fa-netflix", color: "text-red-600" },
    "sp": { name: "Spotify", icon: "fa-brands fa-spotify", color: "text-green-600" },
    
    // Financial & Business
    "pa": { name: "PayPal", icon: "fa-brands fa-paypal", color: "text-blue-600" },
    "bn": { name: "Binance", icon: "fa-solid fa-bitcoin-sign", color: "text-yellow-500" },
    "cb": { name: "Coinbase", icon: "fa-solid fa-bitcoin-sign", color: "text-blue-600" },
    "mt": { name: "Meta", icon: "fa-solid fa-circle-nodes", color: "text-blue-500" },
    
    // Other Services
    "ot": { name: "Other", icon: "fa-solid fa-question", color: "text-gray-500" }
};

export function getServiceInfo(code) {
    return SERVICE_MAP[code] || { 
        name: code.toUpperCase(), 
        icon: "fa-solid fa-comment-sms", 
        color: "text-slate-400" 
    };
}

// 🔥 YOUR PROXY
const VERCEL_PROXY_URL = "https://lit-proxy.vercel.app/api/proxy";

// ===================== CORE PROXY CALL =====================
async function proxyRequest({ provider, method = "GET", params = {}, body = null }) {
    try {
        let url = `${VERCEL_PROXY_URL}?provider=${provider}`;

        if (method === "GET" && params) {
            const query = new URLSearchParams(params).toString();
            if (query) url += `&${query}`;
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: method === "POST" ? JSON.stringify(body || {}) : undefined
        });

        if (!res.ok) {
            throw new Error(`Proxy error: ${res.status}`);
        }

        return res;
    } catch (err) {
        console.error("Proxy Request Failed:", err);
        throw err;
    }
}



function safeAddress(addr) {
    try {
        if (!addr) return null;

        // fix common typo: Ox → 0x
        addr = addr.replace(/^Ox/, "0x");

        return ethers.getAddress(addr); // checksum validation
    } catch (e) {
        console.warn("Invalid address skipped:", addr);
        return null;
    }
}


// ===================== HERO SMS =====================
export async function callHeroSms(params = {}) {
    const res = await proxyRequest({
        provider: "hero",
        method: "GET",
        params
    });

    return await res.text();
}

// ===================== SMM WIZ =====================

// 🔥 GET (services, balance, etc.) - Now using Followiz
export async function callSmmWizGet(params = {}) {
    console.log('🔍 Followiz GET Request:', params);
    const res = await proxyRequest({
        provider: "followiz",
        method: "POST", // Followiz uses POST for all
        body: params
    });
    const data = await res.json();
    console.log('📥 Followiz GET Response:', data);
    return data;
}

// 🔥 POST (placing orders) - Now using Followiz
export async function callSmmWizPost(data = {}) {
    console.log('🚀 Followiz POST Request:', data);
    const res = await proxyRequest({
        provider: "followiz",
        method: "POST",
        body: data
    });
    const responseData = await res.json();
    console.log('📤 Followiz POST Response:', responseData);
    return responseData;
}

// ===================== WEB3 VAULT =====================
export const VAULT_CONFIG = {
    bscAddress: "0x93eE44658c85073cD81Db941017E66b43B020c59",
    ercAddress: "0x93eE44658c85073cD81Db941017E66b43B020c59",
    minDepositUsd: 5.00,
    abi: [
        "function userTotalDeposited(bytes32) public view returns (uint256)",
        "function depositNative(bytes32 _userIdHex) public payable",
        "function depositToken(bytes32 _userIdHex, address _token, uint256 _amount) public",
        "function withdrawNative() public",
        "function withdrawToken(address _token) public",
        "function owner() public view returns (address)",
        "receive() external payable"
    ]
};

const PROVIDERS = {
    bsc: new ethers.JsonRpcProvider("https://rpc.ankr.com/bsc/4829a61239a11f88dceb0f5303142c397305c1a0bed0271231dc712a41db3918"),
    eth: new ethers.JsonRpcProvider("https://rpc.ankr.com/eth/4829a61239a11f88dceb0f5303142c397305c1a0bed0271231dc712a41db3918")
};

// ===================== UTILITIES =====================
export function getUserIdHex(uid) {
    return ethers.keccak256(ethers.toUtf8Bytes(uid));
}

export async function syncOnChainBalance(userId) {
    const userRef = doc(db, "users", userId);

    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();

        // ✅ sanitize wallet
        const wallet = safeAddress(userData.walletAddress);
        if (!wallet) {
            console.error("Invalid user wallet");
            return;
        }

        // ===================== GET PRICES =====================
        const priceRes = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,tether,usd-coin&vs_currencies=ngn"
        );
        const prices = await priceRes.json();

        let totalNGN = 0;

        // ===================== ETH NETWORK =====================
        const ethProvider = PROVIDERS.eth;

        try {
            const ethBalance = await ethProvider.getBalance(wallet);
            const ethValue = Number(ethers.formatEther(ethBalance)) * prices.ethereum.ngn;
            totalNGN += ethValue;
        } catch (e) {
            console.warn("ETH balance error");
        }

        for (const [symbol, rawAddress] of Object.entries(TOKENS.eth)) {
            const tokenAddress = safeAddress(rawAddress);
            if (!tokenAddress) continue;

            try {
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, ethProvider);

                const [bal, dec] = await Promise.all([
                    contract.balanceOf(wallet),
                    contract.decimals()
                ]);

                const value = Number(ethers.formatUnits(bal, dec));
                const priceKey = symbol === "USDT" ? "tether" : "usd-coin";

                totalNGN += value * prices[priceKey].ngn;

            } catch (e) {
                console.warn(`ETH ${symbol} fetch failed`);
            }
        }

        // ===================== BSC NETWORK =====================
        const bscProvider = PROVIDERS.bsc;

        try {
            const bnbBalance = await bscProvider.getBalance(wallet);
            const bnbValue = Number(ethers.formatEther(bnbBalance)) * prices.binancecoin.ngn;
            totalNGN += bnbValue;
        } catch (e) {
            console.warn("BNB balance error");
        }

        for (const [symbol, rawAddress] of Object.entries(TOKENS.bsc)) {
            const tokenAddress = safeAddress(rawAddress);
            if (!tokenAddress) continue;

            try {
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, bscProvider);

                const [bal, dec] = await Promise.all([
                    contract.balanceOf(wallet),
                    contract.decimals()
                ]);

                const value = Number(ethers.formatUnits(bal, dec));
                const priceKey = symbol === "USDT" ? "tether" : "usd-coin";

                totalNGN += value * prices[priceKey].ngn;

            } catch (e) {
                console.warn(`BSC ${symbol} fetch failed`);
            }
        }

        // ===================== BALANCE DIFFERENCE =====================
        const lastSynced = userData.lastSyncedWalletValue || 0;
        const diff = totalNGN - lastSynced;

        if (diff > 50) {
            await updateDoc(userRef, {
                balance: increment(diff),
                lastSyncedWalletValue: totalNGN
            });

            await addDoc(collection(db, "users", userId, "history"), {
                title: "Wallet Deposit",
                amount: diff,
                category: "deposit",
                status: "success",
                timestamp: Date.now(),
                method: "Wallet Auto Sync"
            });

            return { success: true, amount: diff };
        }

        return { success: false, message: "No new deposits" };

    } catch (err) {
        console.error("Sync error:", err);
        return { success: false };
    }
}

async function checkExpiredTransactions(userId) {
    const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
    const now = Date.now();
    const historyRef = collection(db, "users", userId, "history");
    const q = query(historyRef, where("status", "==", "pending"));

    try {
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        let hasUpdates = false;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (now - data.timestamp > FIVE_HOURS_MS) {
                batch.update(docSnap.ref, { 
                    status: 'cancelled',
                    cancellationNote: "Expired after 5 hours" 
                });
                hasUpdates = true;
            }
        });

        if (hasUpdates) await batch.commit();

    } catch (e) {
        console.error("Cleanup error:", e);
    }
}

async function syncCustodialWallet(user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists() || !docSnap.data().walletAddress) {
        const wallet = ethers.Wallet.createRandom(); 
        await updateDoc(userRef, {
            walletAddress: wallet.address,
            vaultKey: wallet.privateKey 
        });
        return wallet.address;
    }

    return docSnap.data().walletAddress;
}

export function protectPage(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'onboarding.html';
        } else {
            const walletAddress = await syncCustodialWallet(user);
            await checkExpiredTransactions(user.uid);
            
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    data.uid = user.uid;
                    data.walletAddress = walletAddress;
                    callback(data);
                }
            });
        }
    });
}

export async function processSmsOrder(userId, currentBalance, cost, serviceName, category, apiOrderId, serviceData, serviceCode = null) {
    if (currentBalance < cost) {
        alert("Insufficient Balance.");
        return false;
    }

    if (!category || !['sms', 'boost'].includes(category)) {
        console.error("Invalid category:", category);
        alert("Order configuration error. Please try again.");
        return false;
    }

    try {
        const userRef = doc(db, "users", userId);
        const historyRef = collection(db, "users", userId, "history");
        const userIdHex = getUserIdHex(userId);

        // ===================== DEDUCT BALANCE =====================
        await updateDoc(userRef, {
            balance: increment(-cost),
            totalSpent: increment(cost),
            totalOrders: increment(1)
        });

        // ===================== SAVE ORDER WITH PROPER FIELDS =====================
        let orderData = {
            title: serviceName,
            amount: cost,
            category: category,      // ✅ 'sms' or 'boost'
            status: 'pending',        // ✅ Waiting for OTP or boost completion
            apiOrderId: apiOrderId,   // ✅ Track with provider API
            userIdHex: userIdHex,
            timestamp: Date.now(),
            method: 'Custodial Vault'
        };

        // ✅ Add category-specific fields
        if (category === 'sms') {
            orderData.phoneNumber = serviceData;  // Phone number from HeroSMS
            orderData.otpCode = null;             // Will be populated when OTP arrives
            orderData.serviceCode = serviceCode;  // Store service code for icon/color lookup
        } else if (category === 'boost') {
            orderData.targetUrl = serviceData;    // Target URL for the boost
            orderData.apiStatus = null;           // Will be updated with SMMWiz status
        }

        const orderRef = await addDoc(historyRef, orderData);

        // ===================== NOTIFY USER =====================
        const notifRef = collection(db, "users", userId, "notifications");
        await addDoc(notifRef, {
            title: `${category.toUpperCase()} Order Created`,
            message: `${serviceName} - Order ID: ${apiOrderId}`,
            type: "order",
            read: false,
            timestamp: Date.now(),
            orderId: orderRef.id
        });

        return true;

    } catch (error) {
        console.error("Critical Order Error:", error);
        alert("Transaction failed. Please contact support.");
        return false;
    }
}

window.logoutUser = () => {
    signOut(auth).then(() => {
        window.location.href = 'onboarding.html';
    });
};
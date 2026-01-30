// landing.js - FINAL VERSION WITH LIVE CHATBOT LOGIC

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function () {
    initializeLanding();
});

function initializeLanding() {
    setupMobileNavigation();
    setupScrollEffects();
    setupCareerTabs();
    setupChatbotUI(); // This activates the chatbot
}

// --- SETUP FUNCTIONS ---

function setupMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function setupCareerTabs() {
    const tabBtns = document.querySelectorAll('.careers-tabs .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const category = event.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            showCareerCategory(category, event.target);
        });
    });
}

// --- CHATBOT LOGIC ---

function setupChatbotUI() {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');

    if (!chatBubble || !chatWindow || !chatClose || !chatSend || !chatInput) return;

    chatBubble.addEventListener('click', () => chatWindow.classList.toggle('active'));
    chatClose.addEventListener('click', () => chatWindow.classList.remove('active'));

    chatSend.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

async function handleSendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (message === '') return;

    addMessageToChat('user', message);
    chatInput.value = '';

    // --- IMPORTANT: REPLACE WITH YOUR LIVE KEYS FROM STEP 3 ---
    const supabaseUrl = 'https://wasnboxwjazwnsqxeobs.supabase.co'; // Paste your Project URL here
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc25ib3h3amF6d25zcXhlb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDQ0NzAsImV4cCI6MjA3NDYyMDQ3MH0.1QUxkabTQesXHKm4zLUJWD0ElXG1At_HmtbzkN5JuIc';      // Paste your Anon Key here
    // ---

    const functionUrl = `${supabaseUrl}/functions/v1/chatbot`;

    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${anonKey}`
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        addMessageToChat('bot', data.reply);

    } catch (error) {
        console.error("Error calling chatbot function:", error);
        addMessageToChat('bot', 'Sorry, I am having trouble connecting. Please try again later.');
    }
}

function addMessageToChat(sender, text) {
    const chatBody = document.getElementById('chat-body');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// --- OTHER CORE FUNCTIONS ---

function showCareerCategory(category, clickedButton) {
    document.querySelectorAll('.careers-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.career-category').forEach(cat => cat.classList.remove('active'));
    if (clickedButton) clickedButton.classList.add('active');
    const targetCategory = document.getElementById(category);
    if (targetCategory) targetCategory.classList.add('active');
}

function uploadResume() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            alert('Resume uploaded! Please log in or register to continue.');
            setTimeout(() => { window.location.href = 'login.html'; }, 500);
        }
    });
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}
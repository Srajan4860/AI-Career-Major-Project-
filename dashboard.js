// dashboard.js - FINAL VERSION (Roadmap in dedicated section)
import { supabase } from './supabase-client.js';

let currentUser = null;

// --- DATA STRUCTURES ---

// Static data for mentors
const mentorsData = [
    // Tech Mentors
    { name: "Dr. Ananya Sharma", title: "Lead Data Scientist at Google", avatar: "https://i1.rgstatic.net/ii/profile.image/1115971267895298-1643079692415_Q512/Ananya-Sharma-9.jpg", expertise: ["Machine Learning", "Python", "TensorFlow"], fields: ["Data Science", "AI/Machine Learning"] },
    { name: "Rohan Verma", title: "Principal Engineer at Microsoft", avatar: "https://pbs.twimg.com/profile_images/1223652199529533445/leYuIcsB_400x400.jpg", expertise: ["Cloud Architecture", "Go", "Kubernetes"], fields: ["Software Engineering", "Cloud", "DevOps"] },
    { name: "Vikram Rao", title: "Cybersecurity Analyst at Cisco", avatar: "https://www.rti.org/sites/default/files/expert-images/vikram_rao.png", expertise: ["Ethical Hacking", "Network Security", "SIEM"], fields: ["Cybersecurity"] },
    { name: "Aisha Khan", title: "AI Research Scientist at OpenAI", avatar: "https://tundratechnical-stem.com/wp-content/uploads/2023/08/Aisha-Khan.jpg", expertise: ["Deep Learning", "NLP", "PyTorch"], fields: ["AI/Machine Learning", "Data Science"] },
    { name: "Arjun Mehta", title: "DevOps Lead at Netflix", avatar: "https://www.energystorageweek.in/wp-content/uploads/2024/06/Speakers-2024_Arjun-Mehta.webp", expertise: ["CI/CD", "AWS", "Terraform"], fields: ["DevOps", "Software Engineering", "Cloud"] },
    // Business & Management Mentors
    { name: "Priya Singh", title: "Senior Product Manager at Amazon", avatar: "https://fsia.in/upload_pic/1707147001IMG-20240118-WA0022.jpg", expertise: ["Product Strategy", "Agile", "UX/UI"], fields: ["Product Management", "Business Analytics"] },
    { name: "Sandeep Gupta", title: "Chartered Accountant & Partner", avatar: "https://du8ef2qvb6oy7.cloudfront.net/media/images/4a47c613-479d-49a9-b81b-9f06dd8b2948/DSC01503.jpg?fm=jpg&q=80&fit=max&crop=2460%2C3280%2C0%2C0&w=1000", expertise: ["Audit", "Taxation", "Financial Reporting"], fields: ["Chartered Accountancy", "Financial Analysis"] },
    { name: "Neha Desai", title: "Risk Management Director at HSBC", avatar: "https://pbs.twimg.com/profile_images/1325324937440210944/n2wfEa6X_400x400.jpg", expertise: ["Credit Risk", "Market Risk", "Regulatory Compliance"], fields: ["Risk Management", "Investment Banking", "Financial Analysis"] },
    { name: "Karan Malhotra", title: "Digital Marketing Head at Zeta", avatar: "https://wyss-prod.imgix.net/app/uploads/2023/04/11165158/Karan_Malhotra_copy.jpg?auto=format&q=90&fit=crop&crop=faces&w=650&h=370", expertise: ["SEO", "SEM", "Content Strategy", "Social Media"], fields: ["Digital Marketing"] },
    // Healthcare & Science Mentors
    { name: "Dr. Fatima Ahmed", title: "Hospital Administrator at Apollo Hospitals", avatar: "https://psychiatry.utoronto.ca/sites/default/files/styles/square_1_1_600/public/assets/faculty/image/Fatima%20Ahmed.jpg", expertise: ["Operations Management", "Healthcare Policy", "Patient Care"], fields: ["Healthcare Administration"] },
    { name: "Raj Patel", title: "Biotech Research Lead at Biocon", avatar: "https://texasconnect.utexas.edu/wp-content/uploads/2022/11/raj-patel-portrait-square.jpg", expertise: ["Drug Discovery", "Genomics", "Clinical Trials"], fields: ["Biotechnology", "Medical Research", "Clinical Research"] }
];

// Data for Assessment Tools
const jobSkillsData = {
    "data scientist": ["python", "sql", "machine learning", "statistics", "data visualization", "communication", "pandas", "numpy"],
    "software engineer": ["python", "java", "javascript", "data structures", "algorithms", "git", "sql", "problem solving", "testing"],
    "frontend developer": ["html", "css", "javascript", "react", "vue", "angular", "git", "responsive design", "api integration"],
    "backend developer": ["python", "java", "node.js", "sql", "nosql", "rest api", "docker", "cloud (aws/azure/gcp)", "git"],
    "product manager": ["product strategy", "agile", "user research", "data analysis", "communication", "market analysis", "project management"],
    "cybersecurity analyst": ["network security", "siem", "penetration testing", "risk assessment", "incident response", "cryptography"],
    "chartered accountancy": ["accounting principles", "taxation laws", "auditing", "financial reporting", "corporate law"],
    "digital marketing": ["seo", "sem", "content marketing", "social media marketing", "email marketing", "analytics"],
    "business analytics": ["sql", "excel", "data visualization", "statistical analysis", "business intelligence tools"]
};

const assessmentSkills = {
    "Data Science": ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization", "Pandas", "NumPy"],
    "Software Engineering": ["Java", "Python", "JavaScript", "Data Structures", "Algorithms", "Git", "Databases", "Testing"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Vue", "Angular", "Responsive Design"],
    "Backend Developer": ["Node.js", "Python", "Java", "REST APIs", "SQL", "NoSQL", "Docker", "Cloud Platforms"],
    "Product Management": ["User Research", "Agile Methodologies", "Roadmapping", "Data Analysis", "Market Research"],
    "Cybersecurity": ["Network Fundamentals", "Operating Systems", "Cryptography", "Security Tools (SIEM, IDS/IPS)", "Risk Assessment"],
    "Chartered Accountancy": ["Accounting Standards", "Direct Tax", "Indirect Tax (GST)", "Auditing Practices", "Company Law"],
    "Digital Marketing": ["SEO", "PPC Advertising", "Content Creation", "Social Media Management", "Email Marketing", "Google Analytics"],
    "Business Analytics": ["SQL", "Excel", "Data Visualization", "Statistical Analysis", "Business Intelligence Tools"],
    "Default": ["Communication", "Problem Solving", "Teamwork", "Time Management", "Critical Thinking"]
};

const careerPathData = {
    "Data Science": { entry: "Junior Data Analyst / Data Scientist", mid: "Data Scientist / ML Engineer", senior: "Senior Data Scientist / Lead Data Scientist", related: ["Business Analyst", "Data Engineer", "AI Researcher"] },
    "Software Engineering": { entry: "Junior Software Engineer / Associate Developer", mid: "Software Engineer / Backend Engineer / Frontend Engineer", senior: "Senior Software Engineer / Tech Lead / Architect", related: ["DevOps Engineer", "QA Engineer", "System Administrator"] },
    "Product Management": { entry: "Associate Product Manager / Business Analyst", mid: "Product Manager", senior: "Senior Product Manager / Group Product Manager / Director of Product", related: ["Project Manager", "UX Designer", "Marketing Manager"] },
    "Cybersecurity": { entry: "Security Analyst (SOC Tier 1)", mid: "Security Analyst (Tier 2/3) / Penetration Tester", senior: "Security Architect / Security Manager / CISO", related: ["Network Engineer", "Compliance Officer", "Forensic Analyst"] },
    "Chartered Accountancy": { entry: "Audit Assistant / Articled Clerk", mid: "Chartered Accountant / Audit Manager / Tax Consultant", senior: "Senior Manager / Partner / CFO", related: ["Financial Analyst", "Management Consultant", "Forensic Accountant"] },
    "Digital Marketing": { entry: "Digital Marketing Executive / SEO Analyst / Social Media Executive", mid: "Digital Marketing Manager / SEO Manager / Content Strategist", senior: "Head of Digital Marketing / Marketing Director", related: ["Brand Manager", "Market Research Analyst", "E-commerce Manager"] }
};

const workStyleQuiz = [
    { q: "I prefer tasks that are...", a: "Clearly defined and structured", b: "Open-ended and require creativity" },
    { q: "I enjoy working...", a: "Independently on my own tasks", b: "Collaboratively in a team" },
    { q: "My ideal work environment is...", a: "Stable and predictable", b: "Fast-paced and dynamic" },
    { q: "I am more motivated by...", a: "Solving complex technical problems", b: "Understanding user needs and business goals" },
    { q: "When learning, I prefer...", a: "Following established methods", b: "Experimenting and trying new approaches" }
];


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async function () {
    await initializeDashboard();
});

async function initializeDashboard() {
    await checkAuthentication();

    if (currentUser) {
        // Always show the main dashboard view on initial load
        displayMainDashboard();
        setupNavigation();
        setupLogout();
    } else {
        console.error("Initialization failed: User not authenticated or profile fetch failed.");
        window.location.href = 'login.html'; // Redirect if critical data missing
    }
}

// --- CORE LOGIC & AUTHENTICATION ---

async function checkAuthentication() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        console.error("Error getting session or no session found:", sessionError);
        // Don't redirect immediately, let initializeDashboard handle it
        return;
    }

    const user = session.user;
    console.log("Session found for user:", user.id);
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        currentUser = { ...user }; // Use only auth data if profile fetch fails
        return;
    }

    currentUser = { ...user, ...profile };
    console.log("Current user loaded with profile:", currentUser);
}


// --- ROADMAP GENERATION FLOWS ---

// Flow A: Resume Upload -> Parse -> Save Profile -> Show Dashboard
async function handleResumeUpload(e) {
    const resumeFile = e.target.files[0];
    const fileNameDisplay = document.getElementById('resume-file-name');
    if (!resumeFile || !currentUser) return;

    fileNameDisplay.textContent = `Analyzing ${resumeFile.name}...`;
    const submitBtn = document.querySelector('#roadmap-info-form .generate-btn');
    if (submitBtn) {
       submitBtn.disabled = true;
       submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Resume...';
    }

    try {
        const fileName = `${currentUser.id}/${Date.now()}_${resumeFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, resumeFile);
        if (uploadError) throw new Error(`Failed to upload resume: ${uploadError.message}`);
        console.log("Resume uploaded successfully:", fileName);

        console.log("Invoking Edge Function 'sovren-parser'...");
        const { data: parsedData, error: invokeError } = await supabase.functions.invoke('sovren-parser', { body: { filePath: fileName } });
        if (invokeError) throw new Error(`Edge Function failed: ${invokeError.message || 'Unknown invoke error'}`);
        if(!parsedData || parsedData.error) throw new Error(`Resume parsing failed: ${parsedData?.error || 'Function returned invalid data'}`);
        console.log("Parsed data from resume:", parsedData);

        const resumeUserData = {
            full_name: parsedData.fullName || `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim(),
            career_field: parsedData.latestJobTitle || '',
            experience_level: parsedData.experienceLevel || 'beginner',
            current_skills: parsedData.skills || '',
            career_goals: '', // Keep goals empty for resume upload flow
            info_submitted: true
        };
        console.log("Prepared user data for update:", resumeUserData);

        console.log("Updating profile in database...");
        const { data: updatedProfile, error: updateError } = await supabase.from('profiles').update(resumeUserData).eq('id', currentUser.id).select().single();
        if (updateError) throw new Error(`Failed to save profile: ${updateError.message}`);
        console.log("Profile updated successfully:", updatedProfile);

        currentUser = { ...currentUser, ...updatedProfile };
        console.log("Updated currentUser after resume parse:", currentUser);

        // Don't generate roadmap here, just show success and go back to dashboard/generator view
        showNotification("Resume analyzed and profile updated!", "success");
        if(fileNameDisplay) fileNameDisplay.textContent = `Successfully analyzed ${resumeFile.name}`;

        displayMainDashboard(); // <<< Go back to main dashboard view

    } catch (error) {
        console.error("Error in handleResumeUpload flow:", error);
        showNotification(`Error processing resume: ${error.message}`, 'error');
        if (fileNameDisplay) fileNameDisplay.textContent = `Error analyzing resume. Please try again.`;
        if (submitBtn){
             submitBtn.disabled = false;
             submitBtn.innerHTML = 'Generate My Roadmap';
        }
    }
}

// Flow B: Manual Form Input -> Save Profile -> Show Dashboard
async function handleRoadmapGeneration(e) {
    e.preventDefault();
    if (!currentUser) return;

    const resumeInput = document.getElementById('resume-upload');
    if (resumeInput && resumeInput.files.length > 0) {
        const fileNameDisplay = document.getElementById('resume-file-name');
        if (fileNameDisplay && fileNameDisplay.textContent.startsWith('Analyzing')) {
             console.log("Form submitted, but resume analysis is in progress. Waiting...");
             showNotification("Please wait for resume analysis to complete.", "warning");
             return;
        }
    }

    const submitBtn = e.target.querySelector('.generate-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; // Update text

    const userUpdates = {
        full_name: document.getElementById('full-name')?.value || '',
        career_field: document.getElementById('career-field')?.value || '',
        experience_level: document.getElementById('experience-level')?.value || 'beginner',
        current_skills: document.getElementById('current-skills')?.value || '',
        career_goals: document.getElementById('career-goals')?.value || '',
        info_submitted: true
    };
    console.log("Manual form data for update:", userUpdates);

    console.log("Updating profile in database (manual)...");
    const { data: updatedProfile, error } = await supabase.from('profiles').update(userUpdates).eq('id', currentUser.id).select().single();

    if (error) {
        showNotification('Could not save your profile. Check RLS policies.', 'error');
        console.error("Profile update error (manual):", error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Generate My Roadmap';
    } else {
        console.log("Profile updated successfully (manual):", updatedProfile);
        currentUser = { ...currentUser, ...updatedProfile };

        // Don't generate roadmap here, just show success and go back to dashboard/generator view
        showNotification("Roadmap data saved!", "success");

        displayMainDashboard(); // <<< Go back to main dashboard view
    }
}


// --- UI AND NAVIGATION ---

// Display the main dashboard content (which NOW INCLUDES the generator form)
function displayMainDashboard() {
    console.log("Displaying Main Dashboard...");
    // Hide other potentially visible sections first
    document.querySelectorAll('.main-content .content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the main dashboard container AND the generator form within it
    const dashboard = document.getElementById('dashboard');
    const generator = document.getElementById('roadmap-generator'); // The form container

    if (dashboard) dashboard.style.display = 'block';
    if (generator) {
        generator.style.display = 'block'; // Make sure generator form is visible INSIDE dashboard

        // --- Re-initialize form state based on potentially updated currentUser ---
        const firstName = currentUser?.user_metadata?.first_name || '';
        const lastName = currentUser?.user_metadata?.last_name || '';
        const nameInput = document.getElementById('full-name');
        if (nameInput) nameInput.value = currentUser?.full_name || `${firstName} ${lastName}`.trim();

        const careerFieldInput = document.getElementById('career-field');
        if (careerFieldInput) careerFieldInput.value = currentUser?.career_field || '';

        const experienceLevelSelect = document.getElementById('experience-level');
        if (experienceLevelSelect) experienceLevelSelect.value = currentUser?.experience_level || 'beginner';

        const currentSkillsInput = document.getElementById('current-skills');
        if (currentSkillsInput) currentSkillsInput.value = currentUser?.current_skills || '';

        const careerGoalsInput = document.getElementById('career-goals');
        if (careerGoalsInput) careerGoalsInput.value = currentUser?.career_goals || '';

        // Reset resume upload elements
        const resumeInput = document.getElementById('resume-upload');
        if (resumeInput) resumeInput.value = null; // Clear selected file
        const fileNameDisplay = document.getElementById('resume-file-name');
        if (fileNameDisplay) fileNameDisplay.textContent = '';

        // Reset submit button state
        const submitBtn = generator.querySelector('.generate-btn');
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Generate My Roadmap'; // Or 'Update My Roadmap' if appropriate
        }

        // Ensure listeners are attached
        attachGeneratorListeners();

    } else {
         console.error("Roadmap generator element not found!");
    }

    updateUserInfo(); // Update navbar info

    // Ensure Dashboard tab is marked active
    document.querySelectorAll('.nav-menu .nav-item').forEach(li => li.classList.remove('active'));
    const dashboardLink = document.querySelector('.nav-menu a[href="#dashboard"]');
    if (dashboardLink) dashboardLink.parentElement.classList.add('active');
}


// Function to display the generator form (usually when info_submitted is false)
function displayRoadmapGenerator() {
    console.log("Displaying Roadmap Generator (standalone)...");
    // This function is now primarily for the initial state before info is submitted.
    // displayMainDashboard handles showing the generator after submission.

    document.querySelectorAll('.main-content .content-section').forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });

    const generator = document.getElementById('roadmap-generator');
    if (generator) {
         generator.style.display = 'block'; // Show only the generator

         // Pre-fill name if empty
         const firstName = currentUser?.user_metadata?.first_name || '';
         const lastName = currentUser?.user_metadata?.last_name || '';
         const nameInput = document.getElementById('full-name');
         if (nameInput && !nameInput.value) {
             nameInput.value = `${firstName} ${lastName}`.trim();
         }
          // Clear potentially stale data from previous sessions if needed
          // document.getElementById('career-field').value = '';
          // ... clear others ...

         attachGeneratorListeners(); // Attach listeners

         // Reset file inputs
         const resumeInput = document.getElementById('resume-upload');
         if (resumeInput) resumeInput.value = null;
         const fileNameDisplay = document.getElementById('resume-file-name');
         if (fileNameDisplay) fileNameDisplay.textContent = '';

         // Set sidebar to Dashboard active
         document.querySelectorAll('.nav-menu .nav-item').forEach(li => li.classList.remove('active'));
         const dashboardLink = document.querySelector('.nav-menu a[href="#dashboard"]');
         if (dashboardLink) dashboardLink.parentElement.classList.add('active');

    } else {
         console.error("Roadmap generator element not found!");
         // Fallback? Maybe show dashboard error?
    }
}


// Helper function to attach listeners to the generator form
function attachGeneratorListeners() {
    const roadmapForm = document.getElementById('roadmap-info-form');
    const resumeInput = document.getElementById('resume-upload');

    if (roadmapForm) {
        roadmapForm.removeEventListener('submit', handleRoadmapGeneration); // Prevent duplicates
        roadmapForm.addEventListener('submit', handleRoadmapGeneration);
    }
    if (resumeInput) {
        resumeInput.removeEventListener('change', handleResumeUpload); // Prevent duplicates
        resumeInput.addEventListener('change', handleResumeUpload);
    }
}


// Updates user info in the navbar
function updateUserInfo() {
    // ... (Keep this function exactly as it was) ...
     if (!currentUser) {
         console.warn("updateUserInfo called but currentUser is null.");
         return;
    }
    const nameToDisplay = currentUser.full_name || `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || currentUser.email || 'User';
    const firstName = nameToDisplay.split(' ')[0] || 'User';
    const userNameEl = document.querySelector('.user-name');
    const welcomeMsgEl = document.getElementById('welcome-message'); // Ensure welcome message ID exists in dashboard HTML
    if(userNameEl) userNameEl.textContent = nameToDisplay;
    if(welcomeMsgEl) welcomeMsgEl.textContent = `Welcome back, ${firstName}!`;
    const avatarContainer = document.getElementById('nav-avatar-container');
    if (avatarContainer) {
        if (currentUser.avatar_url) {
            avatarContainer.innerHTML = `<img src="${currentUser.avatar_url}" alt="User Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">`;
        } else {
            const initials = (firstName[0] || '').toUpperCase() + ((nameToDisplay.split(' ')[1] || '')[0] || '').toUpperCase();
            avatarContainer.innerHTML = `<div class="initials-avatar" style="width: 36px; height: 36px; border-radius: 50%; background-color: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">${initials || '?'}</div>`;
        }
    }
    const userRoleEl = document.querySelector('.user-role');
    if(userRoleEl) userRoleEl.textContent = currentUser.career_field || 'Career Explorer';
}

// Sets up click handlers for sidebar navigation links
function setupNavigation() {
     document.querySelectorAll('.nav-menu a').forEach(link => {
        link.replaceWith(link.cloneNode(true)); // Simple way to remove old listeners
    });
     document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', handleNavLinkClick); // Add fresh listener
    });
}

// Handles clicks on navigation links
function handleNavLinkClick(e) {
    e.preventDefault();
    const sectionId = e.currentTarget.getAttribute('href').substring(1);

     // Special check for generator form access
     if (sectionId === 'dashboard' || sectionId === 'roadmap-generator') {
         // Allow going to dashboard (which shows generator) even if info not submitted
          if (sectionId === 'roadmap-generator') {
              displayRoadmapGenerator(); // Explicitly show generator if clicked directly (though it's inside #dashboard now)
          } else {
              displayMainDashboard(); // Show dashboard view (which includes generator)
          }
     }
     // For all other sections, require info_submitted
     else if (!currentUser || currentUser.info_submitted !== true) {
        showNotification("Please generate your roadmap first!", "warning");
        displayMainDashboard(); // Redirect to dashboard/generator
        return;
    } else {
        showSection(sectionId); // Show the clicked section
    }

    // Update active state in sidebar
    document.querySelectorAll('.nav-menu .nav-item').forEach(li => li.classList.remove('active'));
    e.currentTarget.parentElement.classList.add('active');
}

// Logs the user out
async function handleLogout() {
    // ... (Keep this function exactly as it was) ...
    console.log("Logging out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Logout error:", error);
        showNotification('Logout failed. Please try again.', 'error');
    } else {
        window.location.href = 'login.html';
    }
}

// Attaches logout handler to the user menu
function setupLogout() {
    // ... (Keep this function exactly as it was) ...
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.style.cursor = 'pointer';
        userMenu.removeEventListener('click', handleLogout);
        userMenu.addEventListener('click', handleLogout);
    }
}

// Shows a specific content section and hides others
function showSection(sectionId) {
    console.log("Attempting to show section:", sectionId);
    // Hide all sections first
    document.querySelectorAll('.main-content .content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Handle dashboard separately as it contains the generator now
    if (sectionId === 'dashboard') {
         displayMainDashboard(); // Use the dedicated function
         return;
    }

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
        console.log(`Section "${sectionId}" displayed.`);

         // Call specific display functions when showing certain sections
         if (sectionId === 'mentorship') {
            console.log("Calling displayMentors...");
            displayMentors();
         } else if (sectionId === 'courses') {
            console.log("Calling displayCourses...");
            displayCourses();
         } else if (sectionId === 'career-assessment') {
             console.log("Initializing Career Assessment Tools...");
             displaySkillGapAnalysis();
             displaySkillsInventory();
             displayCareerPathExplorer();
             displayWorkStyleQuiz();
        } else if (sectionId === 'roadmap') {
             // Ensure roadmap data exists and generate if needed
             if (!currentUser || !currentUser.info_submitted) {
                 console.warn("Attempted to show roadmap but info not submitted. Redirecting to generator.");
                 displayMainDashboard(); // Show dashboard/generator instead
             } else {
                 // Regenerate roadmap display EVERY time the tab is clicked
                 console.log("Calling generateAndDisplayRoadmap for #roadmap section...");
                 generateAndDisplayRoadmap(currentUser);
             }
         }
         // No special logic needed for 'projects', 'certificates', 'profile' yet

    } else {
        console.error(`Section with ID "${sectionId}" not found! Falling back to dashboard.`);
        displayMainDashboard(); // Fallback safely to the main dashboard view
    }
}


// --- DYNAMIC CONTENT GENERATION ---

// Generates the HTML for the roadmap based on user data
function generateRoadmap(userData) {
    // ... (Keep this function exactly as it was, including debug logs) ...
    console.log("Data received by generateRoadmap:", userData);
    if (!userData) {
         console.error("generateRoadmap called with invalid userData");
         return '<p class="error-message">Error: User data not available to generate roadmap.</p>';
    }
    const { career_field, experience_level } = userData;
    console.log(`Generating roadmap for Field: "${career_field}", Level: "${experience_level}"`);
    let phases = [];
    const normalized_career_field = career_field?.toLowerCase().trim() || '';
    if (normalized_career_field.includes('data') || normalized_career_field.includes('analyst')) {
        console.log("Using Data Science/Analyst roadmap template.");
        phases = [ /* ... data science phases ... */
            { title: 'Phase 1: Foundations', duration: '4 Weeks', milestones: ['Advanced Excel & SQL', 'Statistics & Probability', 'Python for Data Analysis (NumPy, Pandas)'], status: experience_level === 'beginner' ? 'current' : 'completed' },
            { title: 'Phase 2: Core Analysis & Visualization', duration: '8 Weeks', milestones: ['Data Wrangling & Cleaning', 'Data Visualization (e.g., Matplotlib, Seaborn, Tableau/PowerBI)', 'Business Intelligence Concepts'], status: experience_level === 'intermediate' ? 'current' : (experience_level === 'beginner' ? 'pending' : 'completed') },
            { title: 'Phase 3: Advanced Analytics & ML', duration: '6 Weeks', milestones: ['Predictive Modeling Basics', 'Introduction to Machine Learning Algorithms', 'Storytelling with Data', 'Domain Specialization'], status: experience_level === 'advanced' ? 'current' : (experience_level === 'beginner' || experience_level === 'intermediate' ? 'pending' : 'completed') }
         ];
    } else if (normalized_career_field.includes('software') || normalized_career_field.includes('engineer') || normalized_career_field.includes('developer')) {
         console.log("Using Software Engineering roadmap template.");
         phases = [ /* ... software engineering phases ... */
            { title: 'Phase 1: Programming Fundamentals', duration: '6 Weeks', milestones: ['Choose a Language (e.g., Python, Java, JavaScript)', 'Data Structures & Algorithms Basics', 'Version Control (Git)'], status: experience_level === 'beginner' ? 'current' : 'completed' },
            { title: 'Phase 2: Build & Test', duration: '10 Weeks', milestones: ['Learn a Framework (e.g., Django, Spring, React)', 'Database Fundamentals (SQL/NoSQL)', 'Unit & Integration Testing'], status: experience_level === 'intermediate' ? 'current' : (experience_level === 'beginner' ? 'pending' : 'completed') },
            { title: 'Phase 3: Deployment & Specialization', duration: '8 Weeks', milestones: ['Cloud Basics (AWS/Azure/GCP)', 'CI/CD Pipelines', 'System Design Principles', 'Specialize (e.g., Backend, Frontend, Mobile)'], status: experience_level === 'advanced' ? 'current' : (experience_level === 'beginner' || experience_level === 'intermediate' ? 'pending' : 'completed') }
         ];
    }
     else { // Generic roadmap
        console.log(`Generating generic roadmap because career field "${career_field}" was not specifically recognized.`);
        phases = [ /* ... generic phases ... */
            { title: 'Phase 1: Foundational Knowledge', duration: '4 Weeks', milestones: [`Fundamentals of ${career_field || 'Your Field'}`, 'Key Tools and Technologies', 'Industry Best Practices'], status: experience_level === 'beginner' ? 'current' : 'completed' },
            { title: 'Phase 2: Skill Development', duration: '8 Weeks', milestones: ['Intermediate Skills Practice', 'Build a Small Project', 'Networking & Collaboration'], status: experience_level === 'intermediate' ? 'current' : (experience_level === 'beginner' ? 'pending' : 'completed') },
            { title: 'Phase 3: Specialization & Portfolio', duration: '6 Weeks', milestones: [`Advanced Concepts in ${career_field || 'Your Field'}`, 'Major Portfolio Project', 'Interview Preparation & Job Search'], status: experience_level === 'advanced' ? 'current' : (experience_level === 'beginner' || experience_level === 'intermediate' ? 'pending' : 'completed') }
        ];
    }
    let roadmapHTML = `<div class="section-header"><h1>Your Learning Roadmap</h1><p>Personalized path towards ${career_field || 'your career goal'}</p></div><div class="roadmap-container"><div class="roadmap-timeline">`;
    phases.forEach(phase => { /* ... build phase HTML ... */
        let phaseIcon = 'fa-lock'; if (phase.status === 'completed') phaseIcon = 'fa-check'; if (phase.status === 'current') phaseIcon = 'fa-play';
        roadmapHTML += `<div class="roadmap-phase ${phase.status}"><div class="phase-header"><div class="phase-icon"><i class="fas ${phaseIcon}"></i></div><h3>${phase.title}</h3><span class="phase-duration">${phase.duration}</span></div><div class="phase-content">${phase.milestones.map(milestone => `<div class="milestone ${phase.status}"><i class="fas ${phase.status === 'completed' ? 'fa-check-circle' : (phase.status === 'current' ? 'fa-circle-notch fa-spin' : 'fa-circle')}"></i><span>${milestone}</span></div>`).join('')}</div></div>`;
     });
    roadmapHTML += `</div></div>`;
    return roadmapHTML;
}

// Function to handle roadmap display ONLY in the #roadmap section
function generateAndDisplayRoadmap(userData) {
    console.log("Data received by generateAndDisplayRoadmap:", userData);
    const roadmapHTML = generateRoadmap(userData); // Generate the HTML
    const roadmapElement = document.getElementById('roadmap'); // Target the main roadmap section

    // --- REMOVED Dashboard Preview Update Logic ---

    // Always update the main roadmap section's content when called
    if (roadmapElement) {
        roadmapElement.innerHTML = roadmapHTML;
        console.log("Roadmap HTML updated in #roadmap section.");
    } else {
        console.error("Roadmap container element (#roadmap) not found!");
    }

    // --- REMOVED View Switching Logic ---
    // View switching is now handled ONLY by showSection when the user clicks the tab
}


// --- Career Assessment Functions ---

function displaySkillGapAnalysis() {
    // ... (Keep this function exactly as it was) ...
     const analyzeBtn = document.getElementById('analyze-skills-btn');
     const targetRoleInput = document.getElementById('target-role-input');
     const resultsContainer = document.getElementById('skill-gap-results');
     if (!analyzeBtn || !targetRoleInput || !resultsContainer) { console.error("Skill gap analysis elements not found."); return; }
     resultsContainer.style.display = 'none'; resultsContainer.innerHTML = '';
     analyzeBtn.replaceWith(analyzeBtn.cloneNode(true)); // Refresh listener
     document.getElementById('analyze-skills-btn').addEventListener('click', () => {
         const targetRole = targetRoleInput.value.toLowerCase().trim();
         if (!targetRole) { showNotification("Please enter a target job title.", "warning"); return; }
         const userSkillsRaw = currentUser?.current_skills || '';
         const userSkills = new Set(userSkillsRaw.toLowerCase().split(',').map(skill => skill.trim()).filter(skill => skill));
         console.log("User Skills (Set):", userSkills); console.log("Target Role:", targetRole);
         let requiredSkills = [];
         const matchedRole = Object.keys(jobSkillsData).find(key => targetRole.includes(key) || key.includes(targetRole));
         if (matchedRole) { requiredSkills = jobSkillsData[matchedRole]; console.log(`Found required skills for "${matchedRole}":`, requiredSkills); }
         else { console.log(`No predefined skills found for "${targetRole}".`); resultsContainer.innerHTML = `<h2>Analysis for "${targetRoleInput.value}"</h2><p>Sorry, we don't have predefined skill data for this specific role yet.</p>`; resultsContainer.style.display = 'block'; return; }
         const matchingSkills = requiredSkills.filter(reqSkill => userSkills.has(reqSkill) || [...userSkills].some(userSkill => userSkill.includes(reqSkill) || reqSkill.includes(userSkill)));
         const missingSkills = requiredSkills.filter(reqSkill => !matchingSkills.includes(reqSkill));
         console.log("Matching Skills:", matchingSkills); console.log("Missing Skills:", missingSkills);
         let resultsHTML = `<h2>Analysis for "${targetRoleInput.value}" (Matched: ${matchedRole})</h2><div class="skills-list-container">`;
         resultsHTML += `<div class="skills-list match"><h3><i class="fas fa-check-circle"></i> Skills You Have (${matchingSkills.length})</h3><ul>`;
         if (matchingSkills.length > 0) { matchingSkills.forEach(skill => resultsHTML += `<li><i class="fas fa-check"></i> ${skill.charAt(0).toUpperCase() + skill.slice(1)}</li>`); }
         else { resultsHTML += `<li>None of the required skills found in your profile.</li>`; }
         resultsHTML += `</ul></div>`;
         resultsHTML += `<div class="skills-list missing"><h3><i class="fas fa-exclamation-triangle"></i> Skills To Develop (${missingSkills.length})</h3><ul>`;
         if (missingSkills.length > 0) { missingSkills.forEach(skill => resultsHTML += `<li><i class="fas fa-times"></i> ${skill.charAt(0).toUpperCase() + skill.slice(1)}</li>`); }
         else { resultsHTML += `<li>You have all the required skills listed for this role!</li>`; }
         resultsHTML += `</ul></div></div>`;
         resultsContainer.innerHTML = resultsHTML; resultsContainer.style.display = 'block';
     });
}

function displaySkillsInventory() {
    // ... (Keep this function exactly as it was) ...
     const container = document.getElementById('skills-inventory-list');
     const saveBtn = document.getElementById('save-skills-inventory-btn');
     if (!container || !saveBtn) { console.error("Skills inventory elements not found."); return; }
     container.innerHTML = ''; saveBtn.style.display = 'none';
     const userField = currentUser?.career_field || '';
     let skillsToDisplay = [...(assessmentSkills.Default || [])];
     const fieldKey = Object.keys(assessmentSkills).find(key => key !== "Default" && userField.toLowerCase().includes(key.toLowerCase()));
     let introText = '<p style="margin-bottom: 1rem; font-weight: 600;">Rate your general professional skills:</p>';
     if (fieldKey) { skillsToDisplay = [...new Set([...assessmentSkills[fieldKey], ...skillsToDisplay])]; introText = `<p style="margin-bottom: 1rem; font-weight: 600;">Rate your skills for: ${fieldKey}</p>`; }
     container.innerHTML = introText;
     if (skillsToDisplay.length > 0) {
         skillsToDisplay.sort().forEach(skill => { const skillId = `skill-${skill.replace(/[^a-zA-Z0-9]/g, '-')}`; const itemHTML = `<div class="skill-item"><label for="${skillId}">${skill}</label><select id="${skillId}" name="${skillId}"><option value="">Select Level</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>`; container.insertAdjacentHTML('beforeend', itemHTML); });
         saveBtn.style.display = 'block';
         saveBtn.replaceWith(saveBtn.cloneNode(true)); // Refresh listener
         document.getElementById('save-skills-inventory-btn').onclick = () => { const ratings = {}; skillsToDisplay.forEach(skill => { const skillId = `skill-${skill.replace(/[^a-zA-Z0-9]/g, '-')}`; const selectElement = document.getElementById(skillId); if (selectElement && selectElement.value) { ratings[skill] = selectElement.value; } }); console.log("Skills Inventory Ratings:", ratings); showNotification("Skill ratings saved (logged to console for now).", "success"); };
     } else { container.innerHTML = '<p class="placeholder">Could not load skills list.</p>'; }
}

function displayCareerPathExplorer() {
    // ... (Keep this function exactly as it was) ...
     const container = document.getElementById('career-path-info');
     if (!container) { console.error("Career path info container not found."); return; }
     const userField = currentUser?.career_field || '';
     let pathInfo = null;
     const pathKey = Object.keys(careerPathData).find(key => userField.toLowerCase().includes(key.toLowerCase()));
     if (pathKey) { pathInfo = careerPathData[pathKey]; }
     if (pathInfo) { container.innerHTML = `<h3>Typical Path in ${pathKey}:</h3><ul><li><strong>Entry-Level:</strong> ${pathInfo.entry}</li><li><strong>Mid-Level:</strong> ${pathInfo.mid}</li><li><strong>Senior-Level:</strong> ${pathInfo.senior}</li></ul><h3 style="margin-top: 1.5rem;">Related Roles:</h3><ul>${pathInfo.related.map(role => `<li>${role}</li>`).join('')}</ul>`; }
     else { container.innerHTML = '<p class="placeholder">Update your career field in your profile (e.g., "Data Science", "Software Engineering") to explore potential career paths.</p>'; }
}

function displayWorkStyleQuiz() {
    // ... (Keep this function exactly as it was) ...
     const form = document.getElementById('work-style-quiz-form');
     const submitBtn = document.getElementById('submit-quiz-btn');
     const resultsContainer = document.getElementById('quiz-results');
     if (!form || !submitBtn || !resultsContainer) { console.error("Work style quiz elements not found."); return; }
     form.innerHTML = ''; resultsContainer.style.display = 'none';
     workStyleQuiz.forEach((item, index) => { const questionHTML = `<div class="quiz-question"><label>${index + 1}. ${item.q}</label><div class="options"><label><input type="radio" name="q${index}" value="a" required> ${item.a}</label><label><input type="radio" name="q${index}" value="b"> ${item.b}</label></div></div>`; form.insertAdjacentHTML('beforeend', questionHTML); });
     submitBtn.replaceWith(submitBtn.cloneNode(true)); // Refresh listener
     document.getElementById('submit-quiz-btn').onclick = (e) => { e.preventDefault(); const formData = new FormData(form); let scoreA = 0; let scoreB = 0; let answeredQuestions = 0; for (let i = 0; i < workStyleQuiz.length; i++) { const answer = formData.get(`q${i}`); if (answer === 'a') { scoreA++; answeredQuestions++; } else if (answer === 'b') { scoreB++; answeredQuestions++; } } if (answeredQuestions < workStyleQuiz.length) { showNotification("Please answer all quiz questions.", "warning"); return; } let resultText = ''; if (scoreA > scoreB) { resultText = "Your preference leans towards **structured environments** and potentially more **independent or technical roles**. You might thrive in positions with clear goals and established processes."; } else if (scoreB > scoreA) { resultText = "Your preference leans towards **dynamic environments** and potentially more **collaborative or creative roles**. You might enjoy positions that involve teamwork, flexibility, and new challenges."; } else { resultText = "You seem adaptable, showing a balance between structure and flexibility, independence and collaboration. This versatility can be valuable in many roles."; } resultsContainer.innerHTML = `<h3>Your Work Style Preference:</h3><p>${resultText}</p>`; resultsContainer.style.display = 'block'; };
}


// Generates and displays mentor cards with locking logic and filtering
function displayMentors() {
    // ... (Keep this function exactly as it was, including the updated message) ...
     const grid = document.getElementById('mentors-grid');
     if (!grid) { console.error("Mentor grid container (#mentors-grid) not found!"); return; }
     const isProUser = false; // Simulate non-pro user
     console.log("Displaying mentors, Pro status:", isProUser);
     grid.innerHTML = '<div class="loader"></div>';
     const userCareerField = currentUser?.career_field?.toLowerCase().trim() || '';
     console.log("Filtering mentors for career field:", userCareerField);
     const relevantMentors = mentorsData.filter(mentor => { if (!userCareerField) return true; return mentor.fields.some(field => field.toLowerCase().includes(userCareerField) || userCareerField.includes(field.toLowerCase())); });
     console.log(`Found ${relevantMentors.length} relevant mentors.`);
     setTimeout(() => { grid.innerHTML = ''; if (relevantMentors.length > 0) { relevantMentors.forEach(mentor => { const expertiseHTML = mentor.expertise.map(tag => `<span class="tag">${tag}</span>`).join(''); const lockedClass = isProUser ? '' : 'locked'; const buttonText = isProUser ? 'Connect' : 'Pro Access Required'; const cardHTML = `<div class="mentor-card-new ${lockedClass}" data-mentor-name="${mentor.name}"><div class="mentor-card-thumbnail"><img src="${mentor.avatar}" alt="${mentor.name}" loading="lazy"></div><div class="mentor-card-content"><h3>${mentor.name}</h3><p class="mentor-card-provider">${mentor.title}</p><div class="mentor-card-expertise">${expertiseHTML}</div><button class="connect-btn">${buttonText}</button></div></div>`; grid.insertAdjacentHTML('beforeend', cardHTML); }); grid.querySelectorAll('.mentor-card-new').forEach(card => { card.replaceWith(card.cloneNode(true)); }); grid.querySelectorAll('.mentor-card-new').forEach(card => { card.addEventListener('click', (e) => { if (card.classList.contains('locked')) { showNotification("To interact with mentors upgrade to pro", "warning"); } else { const mentorName = card.dataset.mentorName || 'Mentor'; showNotification(`Connecting with ${mentorName}... (Feature coming soon!)`, 'info'); } }); }); } else { grid.innerHTML = `<p>No mentors found matching your career field "${currentUser?.career_field || 'N/A'}". We are expanding our network!</p>`; } }, 10);
}

// Fetches and displays YouTube videos ONLY
async function displayCourses() {
    // ... (Keep this function exactly as it was) ...
     const container = document.getElementById('courses-container');
     if (!container) { console.error("Courses container (#courses-container) not found!"); return; }
     container.innerHTML = '<div class="loader"></div>';
     const query = (currentUser && currentUser.current_skills) ? currentUser.current_skills.split(',')[0].trim() : 'web development';
     if (!query) { console.warn("No skills found for course search, using default."); }
     console.log(`Fetching YouTube videos for query: "${query}"`);
     try {
         const { data: youtubeVideos, error: youtubeError } = await supabase.functions.invoke('youtube-search', { body: { query } });
         if (youtubeError) throw new Error(`YouTube Fetch Error: ${youtubeError.message}`);
         if (!youtubeVideos || youtubeVideos.error) throw new Error(`YouTube API Error: ${youtubeVideos?.error || 'Unknown error'}`);
         let finalHTML = '';
         if (youtubeVideos.length > 0) { finalHTML += `<div class="courses-section"><h2><i class="fab fa-youtube" style="color: #FF0000;"></i> Tutorials from YouTube</h2><div class="courses-grid">${youtubeVideos.map(video => `<div class="course-card"><div class="course-thumbnail"><img src="${video.thumbnail}" alt="${video.title}" loading="lazy"></div><div class="course-content"><h3>${video.title}</h3><p class="course-provider">by ${video.channel}</p><a href="${video.url}" target="_blank" rel="noopener noreferrer">Watch Video</a></div></div>`).join('')}</div></div>`; }
         else { finalHTML += `<p>No relevant YouTube tutorials found for "${query}". Try updating skills.</p>`; }
         container.innerHTML = finalHTML;
     } catch (error) { console.error("Failed overall to load YouTube courses:", error); container.innerHTML = `<p style="text-align: center; color: #ef4444;">Failed to load tutorials. Error: ${error.message}</p>`; }
}


// --- UTILITY FUNCTIONS ---

function showNotification(message, type = 'info') {
    // ... (Keep this function exactly as it was) ...
    const existingNotifications = document.querySelectorAll('.notification'); existingNotifications.forEach(notification => notification.remove());
    const notification = document.createElement('div'); notification.className = `notification notification-${type}`;
    const iconMap = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', warning: 'fas fa-exclamation-triangle', info: 'fas fa-info-circle' };
    notification.innerHTML = `<div class="notification-content"><i class="${iconMap[type] || iconMap.info}"></i><span>${message}</span></div><button class="notification-close" onclick="this.parentElement.style.animation='slideOutRight 0.3s ease-in forwards'; setTimeout(() => this.parentElement.remove(), 300);"><i class="fas fa-times"></i></button>`;
    Object.assign(notification.style, { position: 'fixed', top: '20px', right: '20px', background: getNotificationColor(type), color: 'white', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', minWidth: '300px', maxWidth: '500px', animation: 'slideInRight 0.3s ease-out forwards' });
    if (!document.getElementById('notification-styles')) { const styleSheet = document.createElement("style"); styleSheet.id = 'notification-styles'; styleSheet.textContent = `@keyframes slideInRight { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(110%); opacity: 0; } }`; document.head.appendChild(styleSheet); }
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentElement) { notification.style.animation = 'slideOutRight 0.3s ease-in forwards'; setTimeout(() => notification.remove(), 300); } }, 5000);
}

function getNotificationColor(type) {
    // ... (Keep this function exactly as it was) ...
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    return colors[type] || colors.info;
}
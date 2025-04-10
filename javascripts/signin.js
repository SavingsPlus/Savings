// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk0NaEjSxHgR2OJ8WUoLFX4ubDzR1bae8",
  authDomain: "bank-8dfaa.firebaseapp.com",
  projectId: "bank-8dfaa",
  storageBucket: "bank-8dfaa.firebasestorage.app",
  messagingSenderId: "975346232295",
  appId: "1:975346232295:web:f13201683ae4b23a846b42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get elements from the new UI
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const loadingBtn = document.getElementById('loadingBtn');
const rememberMe = document.getElementById('rememberMe');

// Add event listener
loginForm.addEventListener('submit', login);

async function login(e) {
  e.preventDefault(); // Prevent form submission

  try {
    // Clear previous errors
    errorMessage.style.display = 'none';
    
    // Show loading state
    loginBtn.style.display = 'none';
    loadingBtn.style.display = 'flex';

    // Get form data
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    // Regex validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');
    if (!passwordRegex.test(password)) throw new Error('Password must be at least 8 characters long and include a number and a special character');

    // Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful', userCredential.user);

    // Store remember me preference in localStorage
    if (rememberMe.checked) {
      localStorage.setItem('rememberEmail', email);
    } else {
      localStorage.removeItem('rememberEmail');
    }

    // Redirect to dashboard
    window.location.href = `../htmls/dashboard.html?id=${userCredential.user.uid}`;

  } catch (error) {
    console.error("Login error:", error);

    // Firebase auth-specific error messages
    let errorText = error.message;
    if (error.code === "auth/wrong-password") {
      errorText = "Incorrect password. Please try again.";
    } else if (error.code === "auth/user-not-found") {
      errorText = "No account found with this email.";
    } else if (error.code === "auth/invalid-email") {
      errorText = "Invalid email format.";
    } else if (error.code === "auth/too-many-requests") {
      errorText = "Account temporarily locked due to too many failed attempts. Please try again later or reset your password.";
    } else if (error.code && error.code.includes("auth/")) {
      errorText = "Invalid email or password";
    }

    // Show error message
    errorMessage.textContent = errorText;
    errorMessage.style.display = 'block';
    
    // Add error styling to inputs
    document.getElementById('email').style.borderColor = 'var(--error)';
    document.getElementById('password').style.borderColor = 'var(--error)';
  } finally {
    // Reset button state
    loginBtn.style.display = 'flex';
    loadingBtn.style.display = 'none';
  }
}

// Check for remembered email on page load
document.addEventListener('DOMContentLoaded', () => {
  const rememberedEmail = localStorage.getItem('rememberEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    rememberMe.checked = true;
  }

  // Clear error styling when user starts typing
  document.getElementById('email').addEventListener('input', () => {
    document.getElementById('email').style.borderColor = 'var(--gray-200)';
  });
  
  document.getElementById('password').addEventListener('input', () => {
    document.getElementById('password').style.borderColor = 'var(--gray-200)';
  });
});

// Optional: Google Sign-In functionality would go here
// You would need to import and initialize the Google Auth provider
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

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
const db = getFirestore(app);
const bankUsersRef = collection(db, "bankUsers");

// DOM Elements
const signUpForm = document.getElementById('signUpForm');
const createBTN = document.getElementById('createBTN');
const createBTNB = document.getElementById('createBTNB');
const logo = document.querySelector('.logo');
const loginLink = document.querySelector('.login-link a');

// Event Listeners
signUpForm?.addEventListener('submit', register);
logo?.addEventListener('click', goToHomePage);
loginLink?.addEventListener('click', goToLoginPage);

// Account Generation Functions
function generateAdvancedAccountNumber() {
  const prefix = '62'; // Standard bank prefix
  let accountNumber = prefix;
  
  // Generate 8 random digits
  for (let i = 0; i < 8; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }
  
  // Add Luhn check digit
  accountNumber += calculateLuhnCheckDigit(accountNumber);
  
  // Format with spacing (XXXX XXXX XX)
  return `${accountNumber.slice(0, 4)} ${accountNumber.slice(4, 8)} ${accountNumber.slice(8)}`;
}

function calculateLuhnCheckDigit(number) {
  let sum = 0;
  let alternate = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit = (digit % 10) + 1;
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return (10 - (sum % 10)) % 10;
}

// Utility Functions
function isValidAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    messages: [
      password.length >= minLength ? null : "At least 8 characters",
      hasUpperCase ? null : "At least one uppercase letter",
      hasLowerCase ? null : "At least one lowercase letter",
      hasNumber ? null : "At least one number",
      hasSpecialChar ? null : "At least one special character"
    ].filter(msg => msg !== null)
  };
}

// Navigation Functions
function goToHomePage() {
  location.href = "../index.html";
} 

function goToLoginPage(e) {
  e.preventDefault();
  location.href = "../htmls/login.html";
}

// Show error message for a specific field
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  
  if (field && errorElement) {
    field.style.borderColor = 'var(--error)';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// Clear error message for a specific field
function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  
  if (field && errorElement) {
    field.style.borderColor = 'var(--gray-200)';
    errorElement.style.display = 'none';
  }
}

// Clear all error messages
function clearAllErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  const inputs = document.querySelectorAll('input, select');
  
  errorElements.forEach(el => el.style.display = 'none');
  inputs.forEach(input => input.style.borderColor = 'var(--gray-200)');
}

// Main Registration Function
async function register(e) {
  e.preventDefault();
  
  try {
    // Clear previous errors
    clearAllErrors();
    
    // UI Loading state
    createBTN.style.display = 'none';
    createBTNB.style.display = 'flex';
    
    // Get form values
    const userDetails = {
      name: signUpForm.fullName.value.trim(),
      phone: signUpForm.phone.value.trim(),
      email: signUpForm.email.value.trim().toLowerCase(),
      dob: signUpForm.dob.value.trim(),
      accountType: signUpForm.accountType.value.toUpperCase().trim(),
      password: signUpForm.password.value.trim(),
      confirmPassword: signUpForm.confirmPassword.value.trim(),
      terms: signUpForm.terms.checked,
      accountNumber: generateAdvancedAccountNumber(),
      accountBalance: 273.50, // Starting balance
      createdAt: new Date().toISOString()
    };

    // Validation
    let isValid = true;
    
    if (!/^[A-Z][a-z]+(?: [A-Z][a-z]+)+$/.test(userDetails.name)) {
      showError('fullName', 'Please enter a valid full name (e.g., John Smith)');
      isValid = false;
    }
    
    if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(userDetails.phone)) {
      showError('phone', 'Please enter a valid phone number');
      isValid = false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!isValidAge(userDetails.dob)) {
      showError('dob', 'You must be at least 18 years old to register');
      isValid = false;
    }
    
    if (!userDetails.accountType) {
      showError('accountType', 'Please select an account type');
      isValid = false;
    }
    
    const passwordValidation = validatePassword(userDetails.password);
    if (!passwordValidation.isValid) {
      showError('password', `Password requirements: ${passwordValidation.messages.join(', ')}`);
      isValid = false;
    }
    
    if (userDetails.password !== userDetails.confirmPassword) {
      showError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }
    
    if (!userDetails.terms) {
      // For checkbox, we'll show the error near the checkbox
      const termsError = document.getElementById('terms-error');
      if (termsError) {
        termsError.style.display = 'block';
        termsError.textContent = 'You must accept the terms and conditions';
      }
      isValid = false;
    }

    if (!isValid) {
      throw new Error('Please fix the errors in the form');
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userDetails.email, 
      userDetails.password
    );
    
    // Save additional user data to Firestore
    const { password, confirmPassword, terms, ...userData } = userDetails;
    await setDoc(doc(bankUsersRef, userCredential.user.uid), userData);
    
    // Success
    alert('Account created successfully! Your account number is: ' + userDetails.accountNumber);
    window.location.href = `../htmls/dashboard.html?id=${userCredential.user.uid}`;
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // User-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      showError('email', 'This email is already registered. Please use a different email.');
    } else if (error.code === 'auth/weak-password') {
      showError('password', 'Password is too weak. Please use a stronger password.');
    } else if (error.code) {
      // Show a general error at the top if it's not a field-specific error
      const generalError = document.getElementById('general-error');
      if (generalError) {
        generalError.textContent = 'Registration failed. Please try again later.';
        generalError.style.display = 'block';
      }
    }
    
  } finally {
    // Reset UI state
    if (createBTN && createBTNB) {
      createBTN.style.display = 'flex';
      createBTNB.style.display = 'none';
    }
  }
}

// Add event listeners to clear errors when user starts typing
document.getElementById('fullName')?.addEventListener('input', () => clearError('fullName'));
document.getElementById('email')?.addEventListener('input', () => clearError('email'));
document.getElementById('phone')?.addEventListener('input', () => clearError('phone'));
document.getElementById('dob')?.addEventListener('input', () => clearError('dob'));
document.getElementById('accountType')?.addEventListener('change', () => clearError('accountType'));
document.getElementById('password')?.addEventListener('input', () => clearError('password'));
document.getElementById('confirmPassword')?.addEventListener('input', () => clearError('confirmPassword'));
document.getElementById('terms')?.addEventListener('change', () => {
  const termsError = document.getElementById('terms-error');
  if (termsError) termsError.style.display = 'none';
});
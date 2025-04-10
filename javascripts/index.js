document.getElementById('signup').addEventListener('click', goToSignUpPage);
document.getElementById('getStarted').addEventListener('click', goToSignUpPage);
document.getElementById('signUpFree').addEventListener('click', goToSignUpPage);
document.getElementById('login').addEventListener('click', goTologinPage);

function goToSignUpPage(){
    console.log('ive been clicked');
    location.href = "./htmls/signup.html" 
}
function goTologinPage(){
    console.log('ive been clicked');
    location.href = "./htmls/login.html" 
}


// Global Variables
let desc;
let circle;
let picture;
let picOpen = false;
const sentence = [
    "[A young french developer]", 
    "[HTML, CSS, JS, PHP]",
    "[Vue, Nuxt, Tailwind]",
    "[React, Laravel]"
];
let indexSentence = 0;
let animationDuration = 8000;
let lastScrollTime = 0;
let isScrolling = false;

// Main Initialization Function
document.addEventListener("DOMContentLoaded", function() {
    desc = document.querySelector('#desc');
    circle = document.querySelector('.circle');
    picture = document.querySelector('.picture');
    if (!desc || !circle) return; // Checking the existence of elements

    // Initializing Events
    initEvents();

    // Initial typing with a delay of 2 seconds
    setTimeout(() => {
        typing(sentence[indexSentence], 100);
    }, 2000);
});

// Event Initialization
function initEvents() {
    const url = document.querySelector('.url');
    const checkbox = document.querySelector('#checkbox');
    if (url) {
        url.addEventListener("mouseover", handleMouseOver);
        url.addEventListener("mouseout", handleMouseOut);
        url.addEventListener('click', (event) => {
            event.stopPropagation();
            hide('on');
        });
    }
    document.body.addEventListener('click', () => {
        hide('out');
    });
    if (checkbox) {
        checkbox.addEventListener('click', handleCheckboxClick);
    }
    document.addEventListener('wheel', handleWheel);
    window.addEventListener('mousemove', moveCircle);


    // Display current age
    const birthday = new Date("09/19/2004");   
    const month_diff = Date.now() - birthday.getTime();  
    const age_dt = new Date(month_diff);   
    const year = age_dt.getUTCFullYear();  
    const age = Math.abs(year - 1970);

    document.querySelector('#age').textContent = age;


    // Display discord username
    document.querySelector('#discord').addEventListener('click',()=>{
        alert('Username : cyri__');
    })
}

// Hide picture on click
function hide(statut) {
    if (statut == "on") {
        if (!picOpen) {
            picture.style.opacity = "100%";
            picOpen = true;
        } else {
            picture.style.opacity = "0";
            picOpen = false;
        }
    } else if (picOpen) {
        picture.style.opacity = "0";
        picOpen = false;
    }
}

// Handling mouseover event to display the profile picture
function handleMouseOver() {
    if (!picture || picOpen == true) return;
    picture.style.opacity = "100%";
}

// Handling mouseout event to hide the profile picture
function handleMouseOut() {
    if (!picture || picOpen == true) return;
    picture.style.opacity = "0%";
}

// Handling click event on checkbox to show or hide the animated cursor
function handleCheckboxClick() {
    if (!circle) return;
    const checkbox = document.querySelector('#checkbox');
    circle.style.display = checkbox.checked ? "none" : "block";
}

// Handling mouse wheel scroll event to adjust animation duration
function handleWheel(e) {
    if (!circle) return;
    const now = performance.now();
    const deltaY = e.deltaY !== undefined ? e.deltaY : -e.wheelDeltaY;
    let scrollDirection = deltaY > 0 ? 1 : -1;
    animationDuration = calculateAnimationDuration(scrollDirection, e);
    circle.style.animationDuration = animationDuration + "ms";
    isScrolling = true;
    lastScrollTime = now;
}

// Calculating animation duration based on scroll direction
function calculateAnimationDuration(scrollDirection, e) {
    let newDuration = animationDuration;
    if (scrollDirection === 1) {
        newDuration *= 0.9;
    } else if (scrollDirection === -1) {
        newDuration = Math.max(newDuration * (1 + Math.abs(e.deltaY) / 1000), 2000);
    }
    return Math.min(Math.max(newDuration, 2000), 8000);
}

// Handling mouse move event to move the animated cursor
function moveCircle(e) {
    if (!circle) return;
    let posX = (e.pageX - 30) + 'px';
    let posY = (e.pageY - 25) + 'px';
    circle.style.left = posX;
    circle.style.top = posY;
}

// Function to display text with typing effect
function typing(txt, speed) {
    let i = 0;
    desc.classList.remove('anime');
    let type = setInterval(() => {
        if (i >= txt.length) {
            clearInterval(type);
            desc.classList.add('anime');
            setTimeout(() => {
                desc.classList.remove('anime');
                deleteTyping(100);
            }, 2000);
        } else {
            desc.innerHTML += txt.charAt(i);
            i++;
        }
    }, speed);
}

// Function to delete text with typing effect
function deleteTyping(speed) {
    let i = desc.innerHTML.length;
    let del = setInterval(() => {
        if (i <= 0) {
            clearInterval(del);
            desc.classList.add('anime');
            setTimeout(() => {
                desc.classList.remove('anime');
                indexSentence = (indexSentence + 1) % sentence.length;
                typing(sentence[indexSentence], 100);
            }, 2000);
        } else {
            desc.innerHTML = desc.innerHTML.slice(0, -1);
            i--;
        }
    }, speed);
}

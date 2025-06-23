// Global Variables
let desc;
let circle;
let picture;
let mapIframe;
let picOpen = false;
let mapOpen = false;
const sentence = [
    "[A young French developer]",
    "[HTML, CSS, JS, PHP, SQL, AL]",
    "[C, C++, Java, Python]",
    "[React, Laravel, Symfony, Node.js]",
    "[Business Central, Sage X3, ERP integration]",
    "[Docker, WSL, Git]",
    "[SaaS, Full-Stack Projects]",
    "[Master's student in Software Architecture at CESI]"
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
    mapIframe = document.querySelector('.map-iframe');
    if (!desc || !circle) return;

    // Initializing Events
    initEvents();

    // Initial typing with a delay of 2 seconds
    setTimeout(() => {
        typing(sentence[indexSentence], 100);
    }, 2000);
});

document.addEventListener('DOMContentLoaded', () => {
    const openTerminalBtn = document.getElementById('open-terminal-btn');
    if (openTerminalBtn) {
        openTerminalBtn.addEventListener('click', () => {
            if (window.webTerminal) {
                window.webTerminal.show();
            } else {
                // Si le terminal n'est pas encore chargé, attendre qu'il le soit
                const interval = setInterval(() => {
                    if (window.webTerminal) {
                        window.webTerminal.show();
                        clearInterval(interval);
                    }
                }, 100);
            }
        });
    }
});

// Event Initialization
function initEvents() {
    const url = document.querySelector('.url');
    const locationLink = document.querySelector('.location-link');
    const checkbox = document.querySelector('#checkbox');
    
    // Picture events
    if (url) {
        url.addEventListener("mouseover", handlePictureMouseOver);
        url.addEventListener("mouseout", handlePictureMouseOut);
        url.addEventListener('click', (event) => {
            event.stopPropagation();
            hidePicture('on');
        });
    }
    
    // Map events
    if (locationLink) {
        locationLink.addEventListener("mouseover", handleMapMouseOver);
        locationLink.addEventListener("mouseout", handleMapMouseOut);
        locationLink.addEventListener('click', (event) => {
            event.stopPropagation();
            hideMap('on');
        });
    }
    
    document.body.addEventListener('click', () => {
        hidePicture('out');
        hideMap('out');
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
    const discordBtn = document.querySelector('#discord');
    if (discordBtn) {
        discordBtn.addEventListener('click', () => {
            const modal = document.getElementById('discord-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    }
    // Gestion fermeture du modal Discord
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('discord-modal');
        if (modal && modal.style.display === 'flex') {
            if (e.target.classList.contains('close-modal') || e.target === modal) {
                modal.style.display = 'none';
            }
        }
    });
    // Gestion bouton copier Discord
    const copyBtn = document.querySelector('.copy-discord-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const username = document.getElementById('discord-username').textContent;
            navigator.clipboard.writeText(username).then(() => {
                copyBtn.textContent = 'Copié !';
                copyBtn.disabled = true;
                setTimeout(() => {
                    copyBtn.textContent = 'Copier';
                    copyBtn.disabled = false;
                }, 1200);
            });
        });
    }
}

// Hide picture on click
function hidePicture(statut) {
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

// Hide map on click
function hideMap(statut) {
    if (statut == "on") {
        if (!mapOpen) {
            mapIframe.classList.add("visible");
            mapOpen = true;
        } else {
            mapIframe.classList.remove("visible");
            mapOpen = false;
        }
    } else if (mapOpen) {
        mapIframe.classList.remove("visible");
        mapOpen = false;
    }
}

// Handling mouseover event to display the profile picture
function handlePictureMouseOver() {
    if (!picture || picOpen == true) return;
    picture.style.opacity = "100%";
}

// Handling mouseout event to hide the profile picture
function handlePictureMouseOut() {
    if (!picture || picOpen == true) return;
    picture.style.opacity = "0%";
}

// Handling mouseover event to display the map
function handleMapMouseOver() {
    if (!mapIframe || mapOpen == true) return;
    mapIframe.classList.add("visible");
}

// Handling mouseout event to hide the map
function handleMapMouseOut() {
    if (!mapIframe || mapOpen == true) return;
    mapIframe.classList.remove("visible");
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
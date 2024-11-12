const gridElement = document.getElementById('grid');
const joystick = document.getElementById('joystick');
const circle = document.getElementById('circle');

const timeSpan = document.getElementById('timeSpan');
const scoreSpan = document.getElementById('scoreSpan');

const modal = document.getElementById("modal");
const modalHeader = document.querySelector('.modal-header');
const modalText = document.querySelector('.modal-text');
const modalCloseButton = document.querySelector('.close-button');

const gridSize = 10;
const colors = [];

const gameOver = 0;
let gameMode = 'gameOver';

let limitedTime = 10;
let score = 0;
let goals = 16;

let redursPoints = 1;
let carrot = 5;
let plusPoints = 1;

let modalHeaderText = ""; 
let modalMessageText = ""; 

let clearedCells = [];

for (let i = 0; i < gridSize; i++) {
    clearedCells[i] = []; 
    for (let j = 0; j < gridSize; j++) {
        clearedCells[i][j] = false;
    }
}

timeSpan.innerHTML = `${limitedTime}S`;
scoreSpan.innerHTML = `${score}P`;

const cornImages = [
    'Namnlös design (2).png',
    'Namnlös design (3).png',
    'Namnlös design (6).png'
];

const explosiveImages = [
    'explosive.png',
    'https://purepng.com/public/uploads/large/purepng.com-carrotcarrotdomestic-carrotfast-growingcarrots-1701527243731np6ec.png'
]

let countdownInterval;

function startCountdown() {
    if (countdownInterval) return;
    
    countdownInterval = setInterval(() => {
        limitedTime--;
        timeSpan.innerHTML = `${limitedTime}S`;
        
        if (limitedTime <= gameOver) {
            clearInterval(countdownInterval);
            modalHeaderText = 'TIDEN HAR LÖPT UT'
            modalMessageText = 'FÖRSÖK IGEN'
            showModal();
            
        }
    }, 1000);
}

function collectPoints() {
    score += plusPoints;
    scoreSpan.innerHTML = `${score}P`;

    if (score >= goals) {
        modalHeaderText = 'GRATTIS';
        modalMessageText = 'DU LYCKADES SAMLA TILLRÄCKLIGT MED VINSTPOÄNG INOM TIDSGRÄNDEN';
        showModal();
        clearInterval(countdownInterval);

    } else if(score <= gameOver){
        modalHeaderText = 'DU HAR FÖRLORAT';
        modalMessageText = 'HOPPAS DU HAR INTE LYCKATS SAMLA TILLRÄCKLIGT MED VINSTPOÄNG';
        showModal();
        clearInterval(countdownInterval);
    }

};

function handleGameOver(imgSrc) {

    if(gameMode === 'colectPoints'){
        collectPoints()

    } else if(gameMode === 'gameOver'){

        if(imgSrc.includes(explosiveImages[0])){
            modalHeaderText = 'DU HAR FÖRLORAT'
            modalMessageText = 'HOPPAS ATT DU HAR BÄTTRE LYCKA NÄSTA GÅNG'
            showModal();
            clearInterval(countdownInterval);

        } else if(imgSrc.includes(explosiveImages[1])){
            score -= redursPoints;
        };


        collectPoints()
        scoreSpan.innerHTML = `${score}P`;

    } else if(gameMode === 'reducePoints'){
        
            if (imgSrc.includes(explosiveImages[0])) {
              score -= redursPoints;
        
            } else if (imgSrc.includes(explosiveImages[1])) {
              score -= carrot;
            };

            collectPoints()
            scoreSpan.innerHTML = `${score}P`;
    }
  }

for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
    
        cell.style.backgroundImage = "url('gräns.jpg')";
        cell.style.backgroundSize = 'cover';
        cell.style.backgroundColor = '#dbcf89'

        gridElement.appendChild(cell);
    }
}

function generateRandomCornImage() {
    let randomX, randomY;
    let cell, cellIndex;

    do {
        randomX = Math.floor(Math.random() * gridSize);
        randomY = Math.floor(Math.random() * gridSize);
        cellIndex = randomY * gridSize + randomX;
        cell = gridElement.children[cellIndex];
    } while (clearedCells[randomY][randomX] || cell.querySelector('img')); 

    const randomImageIndex = Math.floor(Math.random() * cornImages.length);
    const randomExplosiveIndex = Math.floor(Math.random() * explosiveImages.length);
    
    const imgSrc = cornImages[randomImageIndex]; 
    const imgSrc2 = explosiveImages[randomExplosiveIndex];
    
    const img = document.createElement('img');

    if(gameMode === 'colectPoints'){
        img.src = imgSrc;

    } else {
        const chooseExplosive = Math.random() > 0.5; 

        if(score < 5){
            img.src = imgSrc;

        } else {

            if (chooseExplosive) {
                img.src = imgSrc2;
            } else {
                img.src = imgSrc;
            }
        }
    };

    img.className = 'img';
    clearedCells[randomY][randomX] = false; 
    cell.appendChild(img); 
}


function genereteMultipleImages () {
    const currentImages = gridElement.querySelectorAll('img').length;
    const imagesToGenerate = 3 - currentImages; 

    for (let i = 0; i < imagesToGenerate; i++) {
        generateRandomCornImage(i);
    }
}

genereteMultipleImages();

const cellSize = gridElement.offsetWidth / gridSize;

const gridRect = gridElement.getBoundingClientRect();
let circleX = gridRect.left + (gridSize / 2) * cellSize - (circle.offsetWidth / 2);
let circleY = gridRect.top + (gridSize / 2) * cellSize - (circle.offsetHeight / 2);

circle.style.left = `${circleX}px`;
circle.style.top = `${circleY}px`;

function clearColorAtPosition(x, y) {
    const gridRect = gridElement.getBoundingClientRect();
    const adjustedX = x - gridRect.left;
    const adjustedY = y - gridRect.top;
   
    const gridX = Math.floor(adjustedX / cellSize);
    const gridY = Math.floor(adjustedY / cellSize);

    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        const cellIndex = gridY * gridSize + gridX;
        const cell = gridElement.children[cellIndex];

        const img = cell.querySelector("img");

      
        if (img) {
            if (img.src.includes(explosiveImages[0]) || img.src.includes(explosiveImages[1])) {
                handleGameOver(img.src); 
            } else {
                collectPoints(); 
            }

      
            cell.removeChild(img);
            clearedCells[gridY][gridX] = false; 
            generateRandomCornImage();
        }
    }
}



let isDragging = false;
let movementInterval; 
let joystickSpeed = 0.1; 

joystick.addEventListener('mousedown', (e) => {
    isDragging = true;
    startMovement(); 
});

joystick.addEventListener('touchstart', (e) => {
    isDragging = true;
    e.preventDefault(); 
    startMovement();
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    joystick.style.transition = 'transform 0.2s'; 
    joystick.style.transform = 'translate(0, 0)';
    stopMovement();
});

document.addEventListener('touchend', () => {
    isDragging = false;
    joystick.style.transition = 'transform 0.2s';
    joystick.style.transform = 'translate(0, 0)';
    stopMovement();
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) handleJoystickMovement(e.clientX, e.clientY);
});

document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        handleJoystickMovement(touch.clientX, touch.clientY);
    }
}, { passive: false });

let joystickX = 0;
let joystickY = 0;
const maxJoystickDistance = 30;

function handleJoystickMovement(clientX, clientY) {
    const joystickRect = joystick.getBoundingClientRect();
    let x = clientX - joystickRect.left - joystickRect.width / 2;
    let y = clientY - joystickRect.top - joystickRect.height / 2;

    // Constrain joystick movement to a circular area
    const distance = Math.sqrt(x * x + y * y);
    if (distance > maxJoystickDistance) {
        x = (x / distance) * maxJoystickDistance;
        y = (y / distance) * maxJoystickDistance;
    }

    // Apply smooth transform
    joystick.style.transition = 'transform 0.05s'; 
    joystick.style.transform = `translate(${x}px, ${y}px)`;

    joystickX = x * joystickSpeed;
    joystickY = y * joystickSpeed;
}

function startMovement() {
    if (movementInterval) return; 

    movementInterval = setInterval(() => {
        if (isDragging) {
            moveCircle(); 
        }
    }, 20);  
}

function stopMovement() {
    clearInterval(movementInterval);
    movementInterval = null;
}

function moveCircle() {
    const gridRect = gridElement.getBoundingClientRect();

    circleX += joystickX;
    circleY += joystickY;

    circleX = Math.max(gridRect.left, Math.min(circleX, gridRect.right - circle.offsetWidth));
    circleY = Math.max(gridRect.top, Math.min(circleY, gridRect.bottom - circle.offsetHeight));

    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;

    clearColorAtPosition(circleX + circle.offsetWidth / 2, circleY + circle.offsetHeight / 2);
    startCountdown(); 
}

const showModal = () => {
    modalHeader.innerHTML = modalHeaderText;
    modalText.innerHTML = modalMessageText;
    modal.classList.remove("hidden");
};

modalCloseButton.addEventListener('click', () => {
    window.location.reload();
})

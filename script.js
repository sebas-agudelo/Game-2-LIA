const gridElement = document.getElementById('grid');
const joystick = document.getElementById('joystick');
const circle = document.getElementById('circle');
const gridSize = 10;
const colors = [];

const timeSpan = document.getElementById('timeSpan');
const scoreSpan = document.getElementById('scoreSpan');

let score = 0;
let goals = 25;
let limitedTime = 39;
const gameOver = 0;

let clearedCells = [];
for (let i = 0; i < gridSize; i++) {
    clearedCells[i] = []; // Skapa en ny array för varje rad
    for (let j = 0; j < gridSize; j++) {
        clearedCells[i][j] = false; // Fyll cellerna med falskt
    }
}

timeSpan.innerHTML = `${limitedTime}S`;
scoreSpan.innerHTML = `${score}P`;

let countdownInterval;

function startCountdown() {
    if (countdownInterval) return;

    countdownInterval = setInterval(() => {
        limitedTime--;
        timeSpan.innerHTML = `${limitedTime}S`;

        if (limitedTime <= gameOver) {
            clearInterval(countdownInterval);
            alert('Game over');
            window.location.reload();
        }
    }, 1000);
}

function collectPoints() {
    score += 1;
    scoreSpan.innerHTML = `${score}P`;
    if (score >= goals) {
        alert('GRATTIS!!!');
        location.reload();
    }
}

// Skapa en array med bildens källor
const cornImages = [
    'Namnlös design (2).png',
    'Namnlös design (3).png',
    'Namnlös design (6).png',
    'explosive.png'
];

function handleGameOver (imgSrc) {
    cornImages.forEach((element, index) => {
        if(imgSrc.includes(element) && index === 3){
            alert('Game Over');
            window.location.reload();
        }
    });
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
        do {
            randomX = Math.floor(Math.random() * gridSize);
            randomY = Math.floor(Math.random() * gridSize);
        } while (clearedCells[randomY][randomX]); 
    
        const cellIndex = randomY * gridSize + randomX;
        const cell = gridElement.children[cellIndex];

        const randomImageIndex = Math.floor(Math.random() * cornImages.length);
        const imgSrc = cornImages[randomImageIndex];

        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'img';
    
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

        if (!clearedCells[gridY][gridX]) {

            const img = cell.querySelector('img');
            if(img){
                handleGameOver(img.src);

            }
            if (img) {
                cell.removeChild(img);
                generateRandomCornImage(); 
                collectPoints();
            }
            
            clearedCells[gridY][gridX] = true;
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
    joystick.style.transform = 'translate(0, 0)';
    stopMovement();
});

document.addEventListener('touchend', () => {
    isDragging = false;
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

function handleJoystickMovement(clientX, clientY) {
    const joystickRect = joystick.getBoundingClientRect();
    let x = clientX - joystickRect.left - joystickRect.width / 2;
    let y = clientY - joystickRect.top - joystickRect.height / 2;

    const distance = Math.sqrt(x * x + y * y);
    if (distance > 30) {
        x = (x / distance) * 30;
        y = (y / distance) * 30;
    }

    joystick.style.transform = `translate(${x}px, ${y}px)`;

    // joystick.style.left = `${x}px`;
    // joystick.style.top = `${y}px`;

  
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





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
    'Namnlös design (6).png'
];

for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';

        cell.style.backgroundImage = "url('gräns.jpg')";
        cell.style.backgroundSize = 'cover';
        cell.style.backgroundColor = '#dbcf89'

        // Lägg till cellen i grid-elementet
        gridElement.appendChild(cell);
    }
}

// Funktion för att generera en slumpmässig majsbild i en tom cell
function generateRandomCornImage() {
    let randomX, randomY;
    do {
        randomX = Math.floor(Math.random() * gridSize);
        randomY = Math.floor(Math.random() * gridSize);
    } while (clearedCells[randomY][randomX]); 

    const cellIndex = randomY * gridSize + randomX;
    const cell = gridElement.children[cellIndex];

    // Välj en slumpmässig bild från cornImages
    const randomImageIndex = Math.floor(Math.random() * cornImages.length);
    const imgSrc = cornImages[randomImageIndex];

    // Skapa en img-tag för majsbilden
    const img = document.createElement('img');
    img.src = imgSrc;
    img.className = 'img';

    cell.appendChild(img); // Lägg till majsbilden
}

generateRandomCornImage();

const cellSize = gridElement.offsetWidth / gridSize;

// Define `circleX` and `circleY` based on the centered position of the grid
const gridRect = gridElement.getBoundingClientRect();
let circleX = gridRect.left + (gridSize / 2) * cellSize - (circle.offsetWidth / 2);
let circleY = gridRect.top + (gridSize / 2) * cellSize - (circle.offsetHeight / 2);

// Set initial position of the circle
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
            // Ta bort majsbilden om den finns
            const img = cell.querySelector('img');
            if (img) {
                cell.removeChild(img);
                generateRandomCornImage(); // Skapa en ny majsbild när den föregående tas bort
                collectPoints(); // Öka poängen
            }

            clearedCells[gridY][gridX] = true; // Markera cellen som rensad
        }
    }
}

let isDragging = false;
let movementInterval; // Intervall för att uppdatera rörelsen kontinuerligt
let joystickSpeed = 0.1; // Hastigheten på rörelsen, kan justeras för att göra det snabbare

joystick.addEventListener('mousedown', (e) => {
    isDragging = true;
    startMovement();  // Starta kontinuerlig rörelse
});

joystick.addEventListener('touchstart', (e) => {
    isDragging = true;
    e.preventDefault(); // Förhindra scrollning
    startMovement();  // Starta kontinuerlig rörelse
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    joystick.style.transform = 'translate(0, 0)';
    stopMovement();  // Stoppa kontinuerlig rörelse
});

document.addEventListener('touchend', () => {
    isDragging = false;
    joystick.style.transform = 'translate(0, 0)';
    stopMovement();  // Stoppa kontinuerlig rörelse
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) handleJoystickMovement(e.clientX, e.clientY);
});

document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        e.preventDefault(); // Förhindra scrollning
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

    // Beräkna rörelsens avstånd
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 30) {
        x = (x / distance) * 30;
        y = (y / distance) * 30;
    }

    joystick.style.transform = `translate(${x}px, ${y}px)`;

    // Uppdatera joystickens koordinater med en högre hastighet
    joystickX = x * joystickSpeed;  
    joystickY = y * joystickSpeed;
}

// Starta kontinuerlig rörelse
function startMovement() {
    if (movementInterval) return; // Förhindra flera intervall

    movementInterval = setInterval(() => {
        if (isDragging) {
            moveCircle();  // Uppdatera traktorns position
        }
    }, 20);  // Uppdatera rörelsen mycket snabbare (var 20 millisekund)
}

// Stoppa kontinuerlig rörelse
function stopMovement() {
    clearInterval(movementInterval);
    movementInterval = null;
}

function moveCircle() {
    const gridRect = gridElement.getBoundingClientRect();

    // Uppdatera cirkelns position
    circleX += joystickX;
    circleY += joystickY;

    // Begränsa rörelsen inom gränserna
    circleX = Math.max(gridRect.left, Math.min(circleX, gridRect.right - circle.offsetWidth));
    circleY = Math.max(gridRect.top, Math.min(circleY, gridRect.bottom - circle.offsetHeight));

    // Uppdatera cirkelns position
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;

    // Kontrollera om cirkeln är inom cellen
    clearColorAtPosition(circleX + circle.offsetWidth / 2, circleY + circle.offsetHeight / 2);
    startCountdown();  // Starta nedräkningen om den inte är igång
}





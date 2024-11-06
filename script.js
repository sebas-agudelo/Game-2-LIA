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

// Joystick funktionalitet
let isDragging = false;

joystick.addEventListener('mousedown', (e) => {
    isDragging = true;
});

joystick.addEventListener('touchstart', (e) => {
    isDragging = true;
    e.preventDefault(); // Förhindra scrollning
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    joystick.style.transform = 'translate(0, 0)';
});

document.addEventListener('touchend', () => {
    isDragging = false;
    joystick.style.transform = 'translate(0, 0)';
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


// För att definiera hur mycket traktorn ska rotera per rörelse (i grader)
const rotationStep = 90; // 90 grader per rörelse (en kvart rotation per gång)
let currentRotation = 0; // Variabel för att hålla koll på den nuvarande rotationen

function handleJoystickMovement(clientX, clientY) {
    const joystickRect = joystick.getBoundingClientRect();
    let x = clientX - joystickRect.left - joystickRect.width / 2;
    let y = clientY - joystickRect.top - joystickRect.height / 2;

    // Beräkna joystickens riktning (vinkel) från mitten
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 30) {
        x = (x / distance) * 30;
        y = (y / distance) * 30;
    }

    joystick.style.transform = `translate(${x}px, ${y}px)`;

    // Variabel för att hålla riktningen på rotationen (uppåt, nedåt, vänster, höger)
    let newRotation = currentRotation;

    // Om rörelsen är mer horisontell (vänster/höger), rotera åt vänster eller höger
    if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
            newRotation = 90;  // Höger
        } else {
            newRotation = -90; // Vänster
        }
    } 
    // Om rörelsen är mer vertikal (uppåt/nedåt), rotera uppåt eller nedåt
    else {
        if (y > 0) {
            newRotation = 180;  // Nedåt
        } else {
            newRotation = 0; // Uppåt (stående)
        }
    }

    // Uppdatera rotationen endast om den har ändrats
    if (newRotation !== currentRotation) {
        currentRotation = newRotation;
        // Roterar traktorn baserat på den nuvarande rotationen
        circle.style.transform = `rotate(${currentRotation}deg)`;
    }

    // Uppdatera traktorns position baserat på joystickens rörelse
    circleX += x / 10;
    circleY += y / 10;

    // Håll traktorn inom gridens gränser
    const gridRect = gridElement.getBoundingClientRect();
    circleX = Math.max(gridRect.left, Math.min(circleX, gridRect.right - circle.offsetWidth));
    circleY = Math.max(gridRect.top, Math.min(circleY, gridRect.bottom - circle.offsetHeight));

    // Använd den uppdaterade positionen för traktorn
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;

    // Rensa cellen vid den nya positionen (om traktorn har rört sig över den)
    clearColorAtPosition(circleX + circle.offsetWidth / 2, circleY + circle.offsetHeight / 2);

    // Starta nedräkningen (om det inte redan är igång)
    startCountdown();  // Kommentera bort om du bara vill ha countdown en gång
}




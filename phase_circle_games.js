// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let circles = [];
let sequence = [];
let playerInput = [];
let level = 1;
let timerEvent;
let clickTimer = 2000; // Default timer duration in milliseconds
let gameStarted = false;
let startButton;
let timerText;

let levelData = [
    { order: [[16, 19], [2, 5], [16, 19]], image: 'sequence1.png', timer: 7000, number: 1 },
    { order: [[23, 26]], image: 'sequence2.png', timer: 11000, number: 3 },
    { order: [[16, 19]], image: 'sequence3.png', timer: 16000, number: 5 },
    { order: [[7, 10, 13], [22, 25], [0, 3, 6], [14, 17, 20]], image: 'sequence4.png', timer: 11000, number: 2 },
    { order: [[15, 18], [15, 18], [9, 12], [2, 5]], image: 'sequence5.png', timer: 7000, number: 1 }
];

function preload() {
    // Preload sequence images and circle images
    this.load.image('sequence1', 'sequence1.png');
    this.load.image('sequence2', 'sequence2.png');
    this.load.image('sequence3', 'sequence3.png');
    this.load.image('sequence4', 'sequence4.png');
    this.load.image('sequence5', 'sequence5.png');
    this.load.image('circle1', '1.png');
    this.load.image('circle2', '2.png');
    this.load.image('circle3', '3.png');
    this.load.image('startButton', 'startButton.png'); // Add start button image
}

let levelText;
function create() {

    // Add start button
    startButton = this.add.image(400, 300, 'startButton').setInteractive();
    startButton.on('pointerdown', () => startGame(this));

    // Hide game elements initially
    hideGameElements(this);

    // Add timer text
    timerText = this.add.text(400, 550, '', {
        fontSize: '24px',
        color: '#fff'
    }).setOrigin(0.5).setVisible(false);

    // Add level text
    levelText = this.add.text(100, 50, `Level: ${level}`, {
        fontSize: '24px',
        color: '#fff'
    }).setOrigin(0.5);
}

function startGame(scene) {

    let circles = [];

    gameStarted = true;
    startButton.setVisible(false);
    showGameElements(scene);
    console.log(level);

    levelText.setText(`Level: ${level}`);



    // Display the sequence image
    const levelInfo = levelData[level - 1];
    scene.add.image(400, 50, `sequence${level}`);

    // Display something below the sequence image
    scene.add.text(400, 100, 'Your Number is : ' + levelInfo.number.toString(), {
        fontSize: '24px',
        color: '#fff'
    }).setOrigin(0.5);

    // Create a grid of circles (4 rows x 7 columns)
    const grid = { rows: 4, cols: 7, spacing: 80 };
    const startX = 100;
    const startY = 150;




    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            const x = startX + col * grid.spacing;
            const y = startY + row * grid.spacing;
            // circle type repeats 1, 2, 3
            const circleType = (col % 3) + 1;
            const circle = scene.add.image(x, y, `circle${circleType}`).setInteractive();

            circle.index = circles.length; // Assign index for reference
            circle.on('pointerdown', () => handleCircleClick(scene, circle));
            circles.push(circle);
        }
    }

    // Set the sequence for the current level
    sequence = levelInfo.order;
    clickTimer = levelInfo.timer;

    // Show timer text
    timerText.setVisible(true);
    updateTimerText(clickTimer / 1000);
    resetClickTimer(scene);

}

function hideGameElements(scene) {
    scene.children.list.forEach(child => {
        if (child !== startButton) {
            child.setVisible(false);
        }
    });
}

function showGameElements(scene) {
    scene.children.list.forEach(child => {
        if (child !== startButton) { // Ensure start button is not shown again
            child.setVisible(true);
        }
    });
}

function handleCircleClick(scene, circle) {
    if (!gameStarted) return;

    // Get the current sub-array in the sequence
    const currentSubArray = sequence[playerInput.length];
    console.log('Current Sub-Array:', currentSubArray, 'Clicked Index:', circle.index);
    console.log('Player Input:', playerInput);

    // Check if the clicked circle index is in the current sub-array
    if (currentSubArray.includes(circle.index)) {
        playerInput.push(circle.index);
        circle.setTint(0x00ff00); // Highlight correct circles

        // Remove the green tint after 1 second
        scene.time.delayedCall(1000, () => {
            circle.clearTint();
        });

        clickTimer = 10000;

        // Move to the next sub-array if the current sub-array is completed
        if (playerInput.length === sequence.length) {
            playerInput = [];
            levelUp(scene);
        } else {
            resetClickTimer(scene);
        }
    } else {
        resetLevel(scene);
    }
}

function resetClickTimer(scene) {
    if (timerEvent) timerEvent.remove();
    let timeLeft = clickTimer / 1000;
    updateTimerText(timeLeft);

    timerEvent = scene.time.addEvent({
        delay: 1000,
        repeat: timeLeft - 1,
        callback: () => {
            timeLeft--;
            updateTimerText(timeLeft);
            if (timeLeft <= 0) {
                resetLevel(scene);
            }
        },
        callbackScope: scene
    });
}

function updateTimerText(timeLeft) {
    timerText.setText(`Time Left: ${timeLeft}s`);
}

function resetLevel(scene) {
    playerInput = [];
    level = 1;
    scene.scene.restart();

}

function levelUp(scene) {
    if (level < 5) {
        level++;
        scene.scene.restart();
    } else {
        // Display win message in bold font and color green
        scene.add.text(400, 300, 'You Win!', { fontSize: '50px', color: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);

        // Add input text box
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = 'Enter your name and screenshot it as proof that you are a capable Elsrift player!';
        inputElement.style.position = 'absolute';
        inputElement.style.left = '10px';
        inputElement.style.top = '350px';
        inputElement.style.fontSize = '24px';
        inputElement.style.width = '1300px'; // Set the width of the input box
        document.body.appendChild(inputElement);

        // Don't restart the game
        gameStarted = false;
        // Disable timer
        timerEvent.remove();
    }
    levelText.setText(`Level: ${level}`);
}

function update() {
    // Game loop logic (if needed)
}

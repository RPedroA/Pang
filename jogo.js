// Trabalho Realizado por Rui Araujo 30118
// Sistemas Multimédia Interativos - DWM 1º Ano
// Variáveis globais
var highScore = 0; // Armazena a pontuação mais alta alcançada pelo jogador
var scoreBank = 0; // Banco de pontos que o jogador pode gastar em upgrades
var pointsBank = 0; // Banco de pontos ganhos durante o jogo atual
const hpUpgradeCost = 20; // Custo do upgrade de HP
const speedUpgradeCost = 10; // Custo do upgrade de velocidade
const reloadUpgradeCost = 20; // Custo do upgrade de recarga
var player; // Referência ao jogador
var playerSpeed = 150; // Velocidade do jogador
var reloadTime = 2000; // Tempo de recarga (em milissegundos)
var playerHP = 1; // Pontos de vida do jogador
var balls; // Grupo de bolas
var cursors; // Controles do cursor
var score = 0; // Pontuação atual do jogador
var projectiles; // Grupo de projéteis
var lastFired = 0; // Tempo da última vez que o jogador atirou

// Scene do Menu
class Menu extends Phaser.Scene {
  constructor() {
    super({ key: "Menu" }); // Chave para identificar a cena do menu
  }

  preload() {
    // Configura o caminho para os assets
    this.load.setPath("./assets/");

    // Carrega os arquivos de áudio
    this.load.audio("mainTheme", "./audio/main-theme.ogg");
    this.load.audio("menu", "./audio/menu.ogg");
    this.load.audio("shoot", "./audio/shoot.wav");
    this.load.audio("hit", "./audio/hit.wav");
    this.load.audio("pop", "./audio/pop.wav");
    this.load.audio("select", "./audio/select.ogg");
    this.load.audio("buy", "./audio/buy.wav");

    // Carrega as imagens dos sprites
    this.load.image("ball", "./sprites/ball.png");
    this.load.image("projectile", "./sprites/projectile.png");
    this.load.image("player", "./sprites/player.png");
    this.load.image("game-background", "./sprites/game-background.png");
  }

  create() {
    // Adiciona sons e configura a música do menu para repetir
    this.menuMusic = this.sound.add("menu", { loop: true });
    this.select = this.sound.add("select");
    this.buy = this.sound.add("buy");

    // Reproduz a música do menu
    this.menuMusic.play();

    // Adiciona a imagem de fundo
    this.add
      .image(0, 0, "game-background")
      .setDisplaySize(this.game.config.width, this.game.config.height)
      .setOrigin(0, 0);

    // Adiciona o título do jogo
    const Title = this.add
      .text(this.game.config.width / 2, 100, "Pang", {
        fontSize: "64px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Adiciona o botão de jogar
    const PlayButton = this.add
      .text(this.game.config.width / 2, this.game.config.height / 2, "Play", {
        fontSize: "40px",
        fill: "#ffffff",
      })
      .setInteractive()
      .setOrigin(0.5);

    // Adiciona a exibição da pontuação mais alta
    const highScoreText = this.add
      .text(this.game.config.width - 16, 16, `High Score: ${highScore}`, {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(1, 0);

    // Adiciona a exibição do banco de pontos
    const scoreBankText = this.add
      .text(16, 16, `Score Bank: ${scoreBank}`, {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0, 0);

    // Adiciona o botão de upgrade de HP
    const upgradeHPText = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 150,
        `Upgrade HP (Cost: ${hpUpgradeCost}, Current: ${playerHP})`,
        { fontSize: "24px", fill: "#ffffff" }
      )
      .setInteractive()
      .setOrigin(0.5);

    // Adiciona o botão de upgrade de velocidade
    const upgradeSpeedText = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 200,
        `Upgrade Speed (Cost: ${speedUpgradeCost}, Current: ${playerSpeed})`,
        { fontSize: "24px", fill: "#ffffff" }
      )
      .setInteractive()
      .setOrigin(0.5);

    // Adiciona o botão de upgrade de recarga
    const upgradeReloadText = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 250,
        `Upgrade Reload (Cost: ${reloadUpgradeCost}, Current: ${reloadTime})`,
        { fontSize: "24px", fill: "#ffffff" }
      )
      .setInteractive()
      .setOrigin(0.5);

    // Adiciona eventos de clique para os botões
    PlayButton.on("pointerdown", () => {
      this.select.play();
      this.menuMusic.stop(); // Para a música do menu
      this.scene.start("Game"); // Inicia a cena do jogo
    });

    // Evento de clique para o botão de upgrade de HP
    upgradeHPText.on("pointerdown", () => {
      if (scoreBank >= hpUpgradeCost) {
        playerHP++; // Aumentea Atributo
        this.buy.play();
        scoreBank -= hpUpgradeCost; // retira dinnheiro
        scoreBankText.setText(`Score Bank: ${scoreBank}`); // atualiza o dinehrio disponivel
        upgradeHPText.setText(
          `Upgrade HP (Cost: ${hpUpgradeCost}, Current: ${playerHP})`
        );
      }
    });

    // Evento de clique para o botão de upgrade de velocidade
    upgradeSpeedText.on("pointerdown", () => {
      if (scoreBank >= speedUpgradeCost) {
        playerSpeed += 10;
        this.buy.play();
        scoreBank -= speedUpgradeCost;
        scoreBankText.setText(`Score Bank: ${scoreBank}`);
        upgradeSpeedText.setText(
          `Upgrade Speed (Cost: ${speedUpgradeCost}, Current: ${playerSpeed})`
        );
      }
    });

    // Evento de clique para o botão de upgrade de recarga
    upgradeReloadText.on("pointerdown", () => {
      if (scoreBank >= reloadUpgradeCost) {
        this.buy.play();
        reloadTime -= 100;
        scoreBank -= reloadUpgradeCost;
        scoreBankText.setText(`Score Bank: ${scoreBank}`);
        upgradeReloadText.setText(
          `Upgrade Reload (Cost: ${reloadUpgradeCost}, Current: ${reloadTime})`
        );
      }
    });
  }
}

// Scene do Jogo
class Game extends Phaser.Scene {
  constructor() {
    super({ key: "Game" }); // Chave para identificar a cena do jogo
  }

  create() {
    // Carrega sons e configura a música principal para repetir
    this.mainTheme = this.sound.add("mainTheme", { loop: true });
    this.hit = this.sound.add("hit");
    this.shoot = this.sound.add("shoot");
    this.pop = this.sound.add("pop");

    // Reproduz a música principal
    this.mainTheme.play();

    // Adiciona a imagem de fundo
    this.add
      .image(0, 0, "game-background")
      .setDisplaySize(this.game.config.width, this.game.config.height)
      .setOrigin(0, 0);

    // Configuração do jogador
    player = this.physics.add.sprite(this.game.config.width / 2, 538, "player");
    player.setCollideWorldBounds(true);
    player.setBounce(0);
    player.setSize(17, 36);
    player.setScale(2);

    // Cria os controles do cursor
    cursors = this.input.keyboard.createCursorKeys();

    // Configuração do chão
    var floor = this.add.rectangle(400, 595, 800, 25, 0x000000, 0);
    this.physics.add.existing(floor, true);
    this.physics.add.collider(player, floor);

    // Configuração das bolas
    balls = this.physics.add.group();
    this.physics.add.collider(balls, floor);
    this.physics.add.overlap(player, balls, hitPlayer, null, this);

    // Configuração dos projéteis
    projectiles = this.physics.add.group();

    // Cria as bolas
    createBalls(this);

    // Texto da pontuação
    this.scoreText = this.add.text(16, 16, "Pontuação: 0", {
      fontSize: "32px",
      fill: "#ffffff",
    });

    // Texto de HP
    this.hpText = this.add.text(16, 48, "HP: " + playerHP, {
      fontSize: "32px",
      fill: "#ffffff",
    });
  }

  update() {

    // Movimento do jogador
    if (cursors.left.isDown) {
      player.setVelocityX(-playerSpeed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(playerSpeed);
    } else {
      player.setVelocityX(0);
    }

    // Disparo do jogador
    if (
      Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey("SPACE")) &&
      this.time.now > lastFired + reloadTime
    ) {
      addProjectile(this, player.x, player.y); // Adiciona um projétil
      lastFired = this.time.now;
      this.shoot.play(); // Reproduz som de disparo
    }

    // Verifica condição de game over
    if (playerHP <= 0 && !this.isGameOver) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;

    // Atualiza o banco de pontos
    scoreBank += score;

    // Atualiza a pontuação mais alta se aplicável
    if (score > highScore) {
      highScore = score;
    }

    // Limpa as bolas e exibe o texto de game over
    balls.clear(true, true);
    const gameOverText = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 50,
        `Score: ${score}`,
        { fontSize: "32px", fill: "#ffffff" }
      )
      .setOrigin(0.5);

    // Reinicia o jogo ao pressionar a tecla ESPAÇO
    this.input.keyboard.once("keydown-SPACE", () => {
      playerHP = 1;
      score = 0;
      this.isGameOver = false;
      this.mainTheme.stop(); // Para a música principal
      this.scene.start("Menu"); // Volta para a cena do menu
    });
  }

  updateScore(points) {
    score += points;
    this.scoreText.setText("Pontuação: " + score);
    scoreBank += pointsBank;
    pointsBank = 0;
  }

  updateHP() {
    this.hpText.setText("HP: " + playerHP);
  }
}

// Configurações do jogo
const config = {
  type: Phaser.AUTO,
  //Resolução do jogo
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, // faz o jogo ocupar todo epaço disponivel na tela sem esticar a imagm
    autoCenter: Phaser.Scale.CENTER_BOTH, // centra o jogo 
  },
  scene: [Menu, Game], //chama as cenas do jogo
  pixelArt: true, //faz o jogo usar nearest neighbour
};

var game = new Phaser.Game(config); // Cria uma nova instância do jogo

// Função para criar as bolas
function createBalls(scene) {
  // Define os tamanhos das bolas
  var ballSizes = [
    { key: "ball", scale: 2.5, size: { width: 33, height: 33 } },
    { key: "ball", scale: 1.5, size: { width: 33, height: 33 } },
    { key: "ball", scale: 0.8, size: { width: 22, height: 22 } },
    { key: "ball", scale: 0.4, size: { width: 11, height: 11 } },
  ];

  var initialInterval = 10000; // Intervalo inicial para criação das bolas
  var reductionFactor = 0.95; // Fator de redução do intervalo

  function createBall() {
    if (scene.isGameOver) return;

    var sizeIndex = Phaser.Math.Between(0, ballSizes.length - 1);
    var size = ballSizes[sizeIndex];

    var x = Phaser.Math.Between(50, 750);
    var ball = balls.create(x, 16, size.key);
    ball.setBounce(1);
    ball.setScale(size.scale);
    ball.setSize(size.size.width, size.size.height);
    ball.setCollideWorldBounds(true);
    ball.setVelocity(Phaser.Math.Between(-200, 200), 20);
    ball.allowGravity = false;
    ball.ballSizeIndex = sizeIndex;

    initialInterval *= reductionFactor;

    scene.time.addEvent({ delay: initialInterval, callback: createBall });
  }

  createBall();
}

// Função chamada quando o jogador é atingido por uma bola
function hitPlayer(player, ball) {
  if (this.isGameOver) return;

  this.hit.play(); 
  playerHP -= 1;
  this.updateHP();

  if (playerHP <= 0) {
    player.setTint(0xff0000);
    this.physics.pause();
    this.gameOver();
  } else {
    ball.disableBody(true, true);
  }
}

// Função para adicionar um projétil
function addProjectile(scene, x, y) {
  if (scene.isGameOver) return;

  var projectile = scene.physics.add.sprite(x, y, "projectile");
  projectile.setVelocityY(-700);
  projectile.setAccelerationY(0);
  projectile.setSize(40, 40);

  scene.time.addEvent({
    delay: 2000,
    callback: function () {
      if (projectile) {
        projectile.destroy();
      }
    },
  });

  scene.physics.add.overlap(projectile, balls, function (projectile, ball) {
    if (!ball.isHit) {
      ball.isHit = true;
      projectile.destroy();
      splitBall(scene, ball);
      ball.destroy();
      scene.updateScore(10);
      scene.pop.play();
    }
  });

  return projectile;
}

// Função para dividir a bola
function splitBall(scene, ball) {
  var ballSizes = [
    { key: "ball", scale: 2.5, size: { width: 33, height: 33 } },
    { key: "ball", scale: 1.5, size: { width: 33, height: 33 } },
    { key: "ball", scale: 0.8, size: { width: 22, height: 22 } },
    { key: "ball", scale: 0.4, size: { width: 11, height: 11 } },
  ];

  if (ball.ballSizeIndex < ballSizes.length - 1) {
    var nextSizeIndex = ball.ballSizeIndex + 1;
    var nextSize = ballSizes[nextSizeIndex];

    for (var i = 0; i < 2; i++) {
      var newBall = balls.create(ball.x, ball.y, nextSize.key);
      newBall.setBounce(1);
      newBall.setScale(nextSize.scale);
      newBall.setSize(nextSize.size.width, nextSize.size.height);
      newBall.setCollideWorldBounds(true);
      newBall.setVelocity(Phaser.Math.Between(-200, 200), 20);
      newBall.allowGravity = false;
      newBall.ballSizeIndex = nextSizeIndex;
      newBall.isHit = false;
    }
  }
}

"use strict";

window.gameStarted = false;

window.startGame = function startGame(initialLetters) {
  if (window.gameStarted) {
    return;
  }

  window.gameStarted = true;
  var canvas = document.getElementById('game-canvas');
  var ctx = canvas.getContext('2d');
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  var allLetters = 'abcdefghijklmnopqrstuvWxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var allLetterWidths = allLetters.split('').reduce(function (acc, letter) {
    ctx.font = '1px Phorssa';
    acc[letter] = ctx.measureText(letter).width;
    return acc;
  }, []);
  var keys = {};
  window.addEventListener('keydown', function (e) {
    keys[e.key] = true;
  });
  window.addEventListener('keyup', function (e) {
    delete keys[e.key];
  });
  var player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 100,
    h: 100,
    vx: 0,
    vy: 0,
    angle: -0.5 * Math.PI
  };
  var playerImg = new window.Image();
  playerImg.src = '/modules/rocket1587555615179.png';
  var score = 0;
  var bullets = [];

  function shoot() {
    bullets.push({
      x: player.x + Math.cos(player.angle) * 50,
      y: player.y + Math.sin(player.angle) * 50,
      vx: Math.cos(player.angle) * 10,
      vy: Math.sin(player.angle) * 10,
      angle: player.angle
    });
  }

  var letters = [];
  window.letters = letters;

  function addLetter(letter, x, y, w, h, direction) {
    var velocity = (1000 - h) / Math.max(1000 - score / 3, 100);

    if (direction === undefined) {
      direction = Math.random() * 2 * Math.PI;
    }

    letters.push({
      letter: letter,
      x: x,
      y: y,
      w: w,
      h: h,
      diagonal: Math.sqrt(w * w + h * h),
      vx: Math.cos(direction) * velocity,
      vy: Math.sin(direction) * velocity,
      angle: -0.5 * Math.PI,
      spin: (Math.random() * 0.01 - 0.005) * velocity / 3
    });
  }

  function addRandomLetter() {
    var letter = allLetters[Math.floor(Math.random() * 52)];
    var h = Math.random() * 230 + 70;
    var w = allLetterWidths[letter] * h;
    var x, y;

    if (Math.random() > 0.5) {
      x = Math.random() * (canvas.width + h * 2) - h;
      y = Math.floor(Math.random()) * (canvas.height + h * 2) - h;
    } else {
      x = Math.floor(Math.random()) * (canvas.width + h * 2) - h;
      y = Math.random() * (canvas.height + h * 2) - h;
    }

    var direction = Math.atan2(Math.random() * canvas.height - y, Math.random() * canvas.width - x);
    addLetter(letter, x, y, w, h, direction);
  }

  var lastSpawnedLetter = Date.now();
  initialLetters.forEach(function (obj) {
    return addLetter(obj.letter, obj.x, obj.y, obj.w, obj.h);
  });

  function loop() {
    if (!window.gameStarted) {
      return;
    }

    setTimeout(loop, 1000 / 60);

    if (keys.ArrowLeft) {
      player.angle -= 0.05;
    }

    if (keys.ArrowRight) {
      player.angle += 0.05;
    }

    if (player.vx * player.vx + player.vy * player.vy < 100) {
      if (keys.ArrowUp) {
        player.vx += Math.cos(player.angle) * 0.05;
        player.vy += Math.sin(player.angle) * 0.05;
      }
    } else {
      player.vx *= 0.95;
      player.vy *= 0.95;
    }

    if (keys[' '] && bullets.length === 0) {
      shoot();
    }

    player.x += player.vx;
    player.y += player.vy;

    if (player.x + player.vx < -50) {
      player.x = canvas.width + 50;
    } else if (player.x + player.vx > canvas.width + 50) {
      player.x = -50;
    }

    if (player.y + player.vy < -50) {
      player.y = canvas.height + 50;
    } else if (player.y + player.vy > canvas.height + 50) {
      player.y = -50;
    }

    var now = Date.now();

    if (now - lastSpawnedLetter > Math.max(3000 - score / 2, 500)) {
      lastSpawnedLetter = now;
      addRandomLetter();
    }

    for (var j = letters.length - 1; j >= 0; j--) {
      var letter = letters[j];

      if (letter.x + letter.vx * 10 < -letter.h || letter.x + letter.vx * 10 > canvas.width + letter.h || letter.y + letter.vy * 10 < -letter.h || letter.y + letter.vy * 10 > canvas.height + letter.h) {
        letters.splice(j, 1);
        break;
      }

      letter.x += letter.vx;
      letter.y += letter.vy;
      letter.angle += letter.spin;
      var dx = letter.x - player.x;
      var dy = letter.y - player.y;
      var angle = Math.atan2(dy, dx);
      var len = Math.sqrt(dx * dx + dy * dy);
      var playerX = letter.x + Math.cos(0.5 * Math.PI - angle + letter.angle) * len;
      var playerY = letter.y + Math.sin(0.5 * Math.PI - angle + letter.angle) * len;

      if (playerX <= letter.x + letter.w * 0.45 && letter.x - letter.w * 0.45 <= playerX && playerY <= letter.y + letter.h * 0.45 && letter.y - letter.h * 0.45 <= playerY) {
        window.gameStarted = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.forceRenderText('game over. score: ' + score);
        return;
      }

      for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];

        var _dx = letter.x - bullet.x;

        var _dy = letter.y - bullet.y;

        var _angle = Math.atan2(_dy, _dx);

        var _len = Math.sqrt(_dx * _dx + _dy * _dy);

        var bulletX = letter.x + Math.cos(0.5 * Math.PI - _angle + letter.angle) * _len;

        var bulletY = letter.y + Math.sin(0.5 * Math.PI - _angle + letter.angle) * _len;

        if (bulletX <= letter.x + letter.w * 0.45 && letter.x - letter.w * 0.45 <= bulletX && bulletY <= letter.y + letter.h * 0.45 && letter.y - letter.h * 0.45 <= bulletY) {
          bullets.splice(i, 1);

          if (letter.h > 70) {
            addLetter(letter.letter, letter.x, letter.y, letter.w / 2, letter.h / 2);
            addLetter(letter.letter, letter.x, letter.y, letter.w / 2, letter.h / 2);
          } else {
            score += 100;
          }

          letters.splice(j, 1);
        }
      }
    }

    for (var _i = bullets.length - 1; _i >= 0; _i--) {
      var _bullet = bullets[_i];
      _bullet.x += _bullet.vx;
      _bullet.y += _bullet.vy;

      if (_bullet.x < 0 || _bullet.x > canvas.width || _bullet.y < 0 || _bullet.y > canvas.height) {
        bullets.splice(_i, 1);
        break;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    letters.forEach(function (letter) {
      ctx.save();
      ctx.translate(letter.x, letter.y);
      ctx.rotate(letter.angle + 0.5 * Math.PI);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.font = letter.h + 'px Phorssa';
      ctx.fillText(letter.letter, 0, 0);
      ctx.restore();
    });
    bullets.forEach(function (bullet) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(bullet.angle + 0.5 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fillRect(-3, -6, 6, 12);
      ctx.restore();
    });
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle + 0.5 * Math.PI);
    ctx.drawImage(playerImg, -player.w / 2, -player.h / 2, player.w, player.h);
    ctx.beginPath();
    ctx.moveTo(-player.w * 0.08, player.h * 0.35);
    ctx.lineTo(player.w * 0.08, player.h * 0.35);
    var vel = keys.ArrowUp ? 0.3 : 0;
    ctx.lineTo(0, player.h * (0.35 + vel));
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.font = '30px monospace';
    ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height - 50);
  }

  loop();
};
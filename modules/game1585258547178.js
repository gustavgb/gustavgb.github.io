window.gameStarted = false
window.startGame = function startGame (initialLetters) {
  if (window.gameStarted) {
    return
  }

  console.log(initialLetters)

  window.gameStarted = true

  const canvas = document.getElementById('game-canvas')
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()

  canvas.width = rect.width
  canvas.height = rect.height

  const keys = {}
  window.addEventListener('keydown', function (e) {
    keys[e.key] = true
  })
  window.addEventListener('keyup', function (e) {
    delete keys[e.key]
  })

  const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 100,
    h: 100,
    vx: 0,
    vy: 0,
    angle: -0.5 * Math.PI,
    lastShootTime: 0
  }

  const playerImg = new window.Image()
  playerImg.src = '/modules/rocket1585258547178.png'

  const bullets = []

  function shoot () {
    bullets.push({
      x: player.x + Math.cos(player.angle) * 50,
      y: player.y + Math.sin(player.angle) * 50,
      vx: Math.cos(player.angle) * 10,
      vy: Math.sin(player.angle) * 10,
      angle: player.angle
    })
  }

  const letters = []
  window.letters = letters

  function addLetter (letter, x, y, w, h) {
    const velocity = h / 1000
    const direction = Math.random() * 2 * Math.PI
    letters.push({
      letter,
      x,
      y,
      w,
      h,
      vx: Math.cos(direction) * velocity,
      vy: Math.sin(direction) * velocity,
      angle: -0.5 * Math.PI,
      spin: (Math.random() * 0.01 - 0.005) * velocity / 3
    })
  }

  initialLetters.forEach(obj => addLetter(
    obj.letter,
    obj.x,
    obj.y,
    obj.w,
    obj.h
  ))

  console.log(letters)

  function loop () {
    setTimeout(loop, 1000 / 60)

    if (keys.ArrowLeft) {
      player.angle -= 0.1
    }
    if (keys.ArrowRight) {
      player.angle += 0.1
    }
    if (keys.ArrowUp && player.vx * player.vy < 100) {
      player.vx += Math.cos(player.angle) * 0.05
      player.vy += Math.sin(player.angle) * 0.05
    }
    if (keys[' '] && Date.now() - player.lastShootTime > 500) {
      player.lastShootTime = Date.now()
      shoot()
    }

    player.x += player.vx
    player.y += player.vy

    if (player.x + player.vx < -50) {
      player.x = canvas.width + 50
    } else if (player.x + player.vx > canvas.width + 50) {
      player.x = -50
    }

    if (player.y + player.vy < -50) {
      player.y = canvas.height + 50
    } else if (player.y + player.vy > canvas.height + 50) {
      player.y = -50
    }

    letters.forEach(letter => {
      letter.x += letter.vx
      letter.y += letter.vy
      letter.angle += letter.spin
    })

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      bullet.x += bullet.vx
      bullet.y += bullet.vy

      for (let j = letters.length - 1; j >= 0; j--) {
        const letter = letters[j]
        const dx = letter.x - bullet.x
        const dy = letter.y - bullet.y
        const angle = Math.atan2(dy, dx)
        const len = Math.sqrt(dx * dx + dy * dy)
        const bulletX = letter.x + Math.cos(0.5 * Math.PI - angle + letter.angle) * len
        const bulletY = letter.y + Math.sin(0.5 * Math.PI - angle + letter.angle) * len

        if (
          bulletX <= letter.x + letter.w * 0.45 &&
          letter.x - letter.w * 0.45 <= bulletX &&
          bulletY <= letter.y + letter.h * 0.45 &&
          letter.y - letter.h * 0.45 <= bulletY
        ) {
          bullets.splice(i, 1)
          letters.splice(j, 1)
        }
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    letters.forEach(letter => {
      ctx.save()
      ctx.translate(letter.x, letter.y)
      ctx.rotate(letter.angle + 0.5 * Math.PI)
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'black'
      ctx.font = letter.h + 'px Phorssa'
      ctx.fillText(letter.letter, 0, 0)
      ctx.restore()
    })

    bullets.forEach(bullet => {
      ctx.save()
      ctx.translate(bullet.x, bullet.y)
      ctx.rotate(bullet.angle + 0.5 * Math.PI)
      ctx.fillStyle = 'black'
      ctx.fillRect(-3, -6, 6, 12)
      ctx.restore()
    })

    ctx.save()
    ctx.translate(player.x, player.y)
    ctx.rotate(player.angle + 0.5 * Math.PI)
    ctx.drawImage(playerImg, -player.w / 2, -player.w / 2, player.w, player.h)
    ctx.restore()
  }

  loop()
}

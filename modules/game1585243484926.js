let gameStarted = false
window.startGame = function startGame () {
  if (gameStarted) {
    return
  }

  gameStarted = true

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
    vel: 0,
    angle: 0
  }

  const playerImg = new window.Image()
  playerImg.src = '/modules/rocket1585243484926.png'

  function loop () {
    setTimeout(loop, 1000 / 60)

    if (keys.ArrowLeft) {
      player.angle -= 0.1
    }
    if (keys.ArrowRight) {
      player.angle += 0.1
    }
    if (keys.ArrowUp) {
      player.vel += 0.05
      if (player.vel > 10) {
        player.vel = 10
      }
    } else if (player.vel > 0) {
      player.vel *= 0.98
    } else {
      player.vel = 0
    }

    player.x += Math.cos(player.angle - 0.5 * Math.PI) * player.vel
    player.y += Math.sin(player.angle - 0.5 * Math.PI) * player.vel

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(player.x, player.y)
    ctx.rotate(player.angle)
    ctx.drawImage(playerImg, -player.w / 2, -player.w / 2, player.w, player.h)
    ctx.restore()
  }

  loop()
}

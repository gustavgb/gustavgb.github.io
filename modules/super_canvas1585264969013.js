let activeTimestamp = 0
let text = 'Gustav Burchardt'

function renderText (timestamp) {
  const canvas = document.getElementById('super-canvas')
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()

  canvas.width = rect.width
  canvas.height = rect.height

  const fontFamily = 'Phorssa'

  function preloadFont () {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.font = '20px ' + fontFamily
    ctx.fillText('a', 0, 0)

    return document.fonts.ready
  }

  function measureLetters () {
    return text
      .split('')
      .reduce((dic, letter) => {
        ctx.font = '1px ' + fontFamily
        dic[letter] = ctx.measureText(letter).width
        return dic
      }, {})
  }

  function getRowTexts (letters, lettersInRow) {
    const rowTexts = []
    for (let i = 0; i < Math.floor(letters / lettersInRow); i++) {
      if (letters - (i * lettersInRow) < lettersInRow * 2) {
        rowTexts.push(text.substring(i * lettersInRow, text.length))
      } else {
        rowTexts.push(text.substr(i * lettersInRow, lettersInRow))
      }
    }
    return rowTexts
  }

  function render (letterWidths, lettersInRow) {
    if (activeTimestamp !== timestamp) {
      return
    }

    if (!lettersInRow) {
      lettersInRow = 1
    }

    const letters = text.length

    const rowTexts = getRowTexts(letters, lettersInRow)

    const imageWidth = rowTexts.reduce((acc, text) => {
      const fontSize = canvas.height / rowTexts.length
      const rowWidth = text.split('').reduce((acc, letter) => acc + letterWidths[letter], 0) * fontSize
      if (rowWidth > acc) {
        return rowWidth
      }
      return acc
    }, 0)

    if (imageWidth < canvas.width / 2 || text.length === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const fontSize = canvas.height / rowTexts.length
      ctx.fillStyle = 'black'
      ctx.textBaseline = 'top'
      ctx.textAlign = 'right'

      rowTexts.reduce((lastY, text) => {
        ctx.font = fontSize + 'px ' + fontFamily
        ctx.fillText(text, canvas.width, lastY)

        return lastY + fontSize
      }, 0)
      if (lettersInRow + 1 <= text.length) {
        setTimeout(() => render(letterWidths, lettersInRow + 1), 150)
      }
    } else if (text.toLowerCase() === 'play') {
      const result = []

      const canvasX = canvas.getBoundingClientRect().x
      const rowTexts = getRowTexts(letters, lettersInRow - 1)
      const fontSize = canvas.height / rowTexts.length
      rowTexts.reduce((lastY, rowText) => {
        const rowWidth = rowText.split('').reduce((acc, letter) => acc + letterWidths[letter], 0) * fontSize

        rowText.split('').reduce((lastX, letter) => {
          const letterWidth = letterWidths[letter] * fontSize
          const letterHeight = fontSize

          result.push({
            x: canvasX + canvas.width - rowWidth + lastX + letterWidth / 2,
            y: lastY + letterHeight / 2,
            w: letterWidth,
            h: letterHeight,
            letter
          })

          return lastX + letterWidth
        }, 0)

        return lastY + fontSize
      }, 0)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      window.startGame(result)
    }
  }

  preloadFont()
    .then(measureLetters)
    .then(render)
}

window.forceRenderText = function (newText) {
  if (newText) {
    text = newText
  }
  activeTimestamp = Date.now()
  renderText(activeTimestamp)
}

window.addEventListener('load', () => renderText(activeTimestamp))
window.addEventListener('resize', function () {
  if (window.gameStarted) {
    return
  }

  window.forceRenderText()
})
window.addEventListener('keydown', function (e) {
  if (window.gameStarted) {
    return
  }

  const prevText = text
  const key = e.key
  if (key === 'Backspace') {
    text = text.substr(0, text.length - 1)
  } else if (key.length === 1 && key !== '¤') {
    text = text + key
  }

  if (prevText !== text) {
    window.forceRenderText()
  }
})

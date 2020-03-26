let activeTimestamp = 0

function renderText (timestamp) {
  const canvas = document.getElementById('super-canvas')

  const rect = canvas.getBoundingClientRect()

  canvas.width = rect.width
  canvas.height = rect.height

  const ctx = canvas.getContext('2d')
  const fontFamily = 'Phorssa'

  function preloadFont () {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.font = '20px ' + fontFamily
    ctx.fillText('a', 0, 0)

    return document.fonts.ready
  }

  function measureLetters () {
    return 'abcdefghijklmnopqrstuvwxyzæøå '
      .split('')
      .reduce((dic, letter) => {
        ctx.font = '1px ' + fontFamily
        dic[letter] = ctx.measureText(letter).width
        return dic
      }, {})
  }

  function render (letterWidths, lettersInRow) {
    if (activeTimestamp !== timestamp) {
      return
    }

    if (!lettersInRow) {
      lettersInRow = 1
    }

    const text = 'Gustav Burchardt'.toLowerCase()
    const letters = text.length

    const rowTexts = []
    for (let i = 0; i < Math.floor(letters / lettersInRow); i++) {
      if (letters - (i * lettersInRow) < lettersInRow * 2) {
        rowTexts.push(text.substring(i * lettersInRow, text.length))
      } else {
        rowTexts.push(text.substr(i * lettersInRow, lettersInRow))
      }
    }

    const imageWidth = rowTexts.reduce((acc, text) => {
      const fontSize = canvas.height / rowTexts.length
      const rowWidth = text.split('').reduce((acc, letter) => acc + letterWidths[letter], 0) * fontSize
      if (rowWidth > acc) {
        return rowWidth
      }
      return acc
    }, 0)

    if (imageWidth < canvas.width) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'black'
      ctx.textBaseline = 'top'
      ctx.textAlign = 'right'

      rowTexts.reduce((lastY, text) => {
        const fontSize = canvas.height / rowTexts.length
        ctx.font = fontSize + 'px ' + fontFamily
        ctx.fillText(text, canvas.width, lastY)

        return lastY + fontSize
      }, 0)
      setTimeout(() => render(letterWidths, lettersInRow + 1), 150)
    }
  }

  preloadFont()
    .then(measureLetters)
    .then(render)
}

window.addEventListener('load', () => renderText(activeTimestamp))
window.addEventListener('resize', function () {
  activeTimestamp = Date.now()
  renderText(activeTimestamp)
})

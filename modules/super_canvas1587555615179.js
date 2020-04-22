"use strict";

var activeTimestamp = 0;
var text = 'Gustav Burchardt';

function renderText(timestamp) {
  var canvas = document.getElementById('super-canvas');
  var ctx = canvas.getContext('2d');
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  var fontFamily = 'Phorssa';

  function preloadFont() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.font = '20px ' + fontFamily;
    ctx.fillText('a', 0, 0);
    return document.fonts.ready;
  }

  function measureLetters() {
    return text.split('').reduce(function (dic, letter) {
      ctx.font = '1px ' + fontFamily;
      dic[letter] = ctx.measureText(letter).width;
      return dic;
    }, {});
  }

  function getRowTexts(letters, lettersInRow) {
    var rowTexts = [];

    for (var i = 0; i < Math.floor(letters / lettersInRow); i++) {
      if (letters - i * lettersInRow < lettersInRow * 2) {
        rowTexts.push(text.substring(i * lettersInRow, text.length));
      } else {
        rowTexts.push(text.substr(i * lettersInRow, lettersInRow));
      }
    }

    return rowTexts;
  }

  function render(letterWidths, lettersInRow) {
    if (activeTimestamp !== timestamp) {
      return;
    }

    if (!lettersInRow) {
      lettersInRow = 1;
    }

    var letters = text.length;
    var rowTexts = getRowTexts(letters, lettersInRow);
    var imageWidth = rowTexts.reduce(function (acc, text) {
      var fontSize = canvas.height / rowTexts.length;
      var rowWidth = text.split('').reduce(function (acc, letter) {
        return acc + letterWidths[letter];
      }, 0) * fontSize;

      if (rowWidth > acc) {
        return rowWidth;
      }

      return acc;
    }, 0);

    if (imageWidth < canvas.width / 2 || text.length === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var fontSize = canvas.height / rowTexts.length;
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'right';
      rowTexts.reduce(function (lastY, text) {
        ctx.font = "".concat(fontSize, "px ").concat(fontFamily);
        ctx.fillText(text, canvas.width, lastY);
        return lastY + fontSize;
      }, 0);

      if (lettersInRow + 1 <= text.length) {
        setTimeout(function () {
          return render(letterWidths, lettersInRow + 1);
        }, 150);
      }
    } else if (text.toLowerCase() === 'play') {
      var result = [];
      var canvasX = canvas.getBoundingClientRect().x;

      var _rowTexts = getRowTexts(letters, lettersInRow - 1);

      var _fontSize = canvas.height / _rowTexts.length;

      _rowTexts.reduce(function (lastY, rowText) {
        var rowWidth = rowText.split('').reduce(function (acc, letter) {
          return acc + letterWidths[letter];
        }, 0) * _fontSize;

        rowText.split('').reduce(function (lastX, letter) {
          var letterWidth = letterWidths[letter] * _fontSize;
          var letterHeight = _fontSize;
          result.push({
            x: canvasX + canvas.width - rowWidth + lastX + letterWidth / 2,
            y: lastY + letterHeight / 2,
            w: letterWidth,
            h: letterHeight,
            letter: letter
          });
          return lastX + letterWidth;
        }, 0);
        return lastY + _fontSize;
      }, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.startGame(result);
    }
  }

  preloadFont().then(measureLetters).then(render);
}

window.forceRenderText = function (newText) {
  if (newText) {
    text = newText;
  }

  activeTimestamp = Date.now();
  renderText(activeTimestamp);
};

window.addEventListener('load', function () {
  return renderText(activeTimestamp);
});
window.addEventListener('resize', function () {
  if (window.gameStarted) {
    return;
  }

  window.forceRenderText();
});
window.addEventListener('keydown', function (e) {
  if (window.gameStarted) {
    return;
  }

  var prevText = text;
  var key = e.key;

  if (key === 'Backspace') {
    text = text.substr(0, text.length - 1);
  } else if (key.length === 1 && key !== '¤') {
    text = text + key;
  }

  if (prevText !== text) {
    window.forceRenderText();
  }
});
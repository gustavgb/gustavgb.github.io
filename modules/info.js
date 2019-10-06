(function () {
  function onClose () {
    document.querySelector('#info-wrapper').classList.remove('open')
    window.localStorage.setItem('has-seen-warning-1', 'yes')
  }

  function onOpen () {
    var date = new Date()
    var isOpen = date > new Date('2019-10-20') && date < new Date('2020-2-15')
    var alreadySeen = window.localStorage.getItem('has-seen-warning-1')

    if (!alreadySeen && isOpen) {
      document.querySelector('#info-wrapper').classList.add('open')
      document.querySelector('#info-wrapper #close-btn').addEventListener('click', onClose)
    }
  }

  setTimeout(onOpen, 500)
})()

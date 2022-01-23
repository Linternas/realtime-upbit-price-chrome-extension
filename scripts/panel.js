// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

chrome.devtools.network.onRequestFinished.addListener((request) => {
  // let message = {
  //   action: 'code',
  //   content: "console.log('Inline script executed')1",
  // }

  // message.tabId = chrome.devtools.inspectedWindow.tabId
  // chrome.extension.sendMessage(message)

  //console.log(request);
  if (request.request.method === 'GET' && request.response.content.mimeType === 'application/json') {
    // console.log(request)



    request.getContent((content, encoding) => {

      let msg = JSON.stringify(content)
      sendObjectToInspectedPage({
        action: 'code',
        content: 'console.log(' + msg + ')',
      })


      // console.log(content, encoding)
      // sendObjectToInspectedPage({
      //   action: 'code',
      //   content: 'console.log(content)',
      // })
      // let message = {
      //   action: 'code',
      //   content: "console.log('Inline script executed')2",
      // }
      // message.tabId = chrome.devtools.inspectedWindow.tabId
      // chrome.extension.sendMessage(message)
    })
  }
})

chrome.devtools.network.getHAR((res) => {
  let msg = JSON.stringify(res)
  sendObjectToInspectedPage({
    action: 'code',
    content: 'console.log(' + msg + ')',
  })
})


document.querySelector('#getHarData').addEventListener(
  'click',
  function () {
    chrome.devtools.network.getHAR((res) => {
      let msg = JSON.stringify(res)
      sendObjectToInspectedPage({
        action: 'code',
        content: 'console.log(' + msg + ')',
      })
    })

    chrome.devtools.network.onRequestFinished.addListener((request) => {
      if (request.request.method === 'GET' && request.response.content.mimeType === 'application/json') {
        request.getContent((content, encoding) => {
          let msg = JSON.stringify(content)
          sendObjectToInspectedPage({
            action: 'code',
            content: 'console.log(' + msg + ')',
          })
        })
      }
    })
  },
  false
)

function init() {
  var port = chrome.runtime.connect({ name: 'Eval in context' })
  var clickFocus = ''

  document.getElementById('mung').addEventListener('click', function () {
    clickFocus = 'mung'
    alert(clickFocus)
  })

  port.onMessage.addListener(function (msg) {
    var text = msg
    document.getElementById(clickFocus).value = text
  })
}

window.onLoad = init()

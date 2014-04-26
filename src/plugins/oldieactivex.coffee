module.exports =
  createXHR: ->
    unless window?.XMLHttpRequest
      try return new ActiveXObject 'Msxml2.XMLHTTP.6.0'
      try return new ActiveXObject 'Msxml2.XMLHTTP.3.0'
      try return new ActiveXObject 'Microsoft.XMLHTTP'

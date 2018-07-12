let socket = io();

socket.on('connect', function () {
    console.log('Client connected to the server!');
})

socket.on('disconnect', function () {
    console.log('Client diconected from the server!');
})

//client listening to the new message event from the server
//client renders new message to window
socket.on('newMessage', function (message) {
    let formattedTime = moment(message.createdAt).format('h:mm:a')
    let li = jQuery('<li></li>');
    li.text(`${message.from}: ${formattedTime}-->${message.text}`)
    jQuery('#messages').append(li)
})

//renders the current loaction with a link
socket.on('newLocationMessage', function (message) {
    let formattedTime = moment(message.createdAt).format('h:mm:a')
    let li = jQuery('<li></li>');
    let a = jQuery('<a target="_blank">Current Location</a>')
    li.text(`${message.from}: ${formattedTime} `)
    a.attr('href', message.url)
    li.append(a)
    jQuery('#messages').append(li)
})

//client creates new message
jQuery('#message-form').on('submit', function (e) {
    e.preventDefault()

    let messageTextBox = jQuery('[name=message]')

    socket.emit('createMessage', {
        from: "user",
        text: messageTextBox.val()
    }, function () {
        messageTextBox.val('')
    })
})

let locationBtn = jQuery('#send-location');

//gets current client location and emits it to other clients
locationBtn.on('click', function (e) {
    if (!navigator.geolocation) {
        return alert('Location Services Fialed')
    }

    locationBtn.attr('disabled', 'disabled').text('Sending location...')

    navigator.geolocation.getCurrentPosition(function (position) {
        locationBtn.removeAttr('disabled').text('Send location')

        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        })
    }, function () {
        locationBtn.removeAttr('disabled').text('Send location')
        alert('Unable to retreive location')
    })
})
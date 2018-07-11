let socket = io();

socket.on('connect', function () {
    console.log('Client connected to the server!');
})

socket.on('disconnect', function () {
    console.log('Client diconected from the server!');
})

//client listening to the new message event from the server
socket.on('newMessage', function (message) {
    console.log("New Message: ", message);
    let li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`)
    jQuery('#messages').append(li)
})

socket.emit('createMessage', {
    from: 'LABron',
    text: 'King James'
}, function (data) {
    console.log('Got it', data);
})

socket.on('newLocationMessage', function (message) {
    let li = jQuery('<li></li>');
    let a = jQuery('<a target="_blank">Current Location</a>')
    li.text(`${message.from}: `)
    a.attr('href', message.url)
    li.append(a)
    jQuery('#messages').append(li)
})

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
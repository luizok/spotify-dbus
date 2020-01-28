let
    _ = require('underscore'),
    DBus = require('dbus');


let bus = DBus.getBus('session');
let spotify = {
    service: 'org.mpris.MediaPlayer2.spotify',
    objectPath: '/org/mpris/MediaPlayer2',
    interfaces: [
        'org.mpris.MediaPlayer2.Player',
        'org.freedesktop.DBus.Properties'
    ]
};
let player = null;

bus.getInterface(spotify.service, spotify.objectPath, spotify.interfaces[0], (err, iface) => {

    if (err) {

        console.log(err);
        process.exit();
    } else {
        player = iface;
        setTimeout(() => { player.Next(); }, 3000);
    }
});

bus.getInterface(spotify.service, spotify.objectPath, spotify.interfaces[1], (err, iface) => {

    if (err) {

        console.log(err);
        process.exit();
    } else {

        let lastState = null;
        iface.on('PropertiesChanged', (str, obj, arr) => {

            // TODO: Find an interface/event that triggers once
            // to avoid repeated states
            let newState = {
                artist: obj.Metadata['xesam:artist'][0],
                music: obj.Metadata['xesam:title'],
                album: obj.Metadata['xesam:album'],
                is_playing: obj.PlaybackStatus === 'Playing'
            };

            if (!_.isEqual(lastState, newState)) {
                console.log(newState);
                lastState = newState;
                setTimeout(() => { player.Next(); }, 3000);
            }
        });
    }

});
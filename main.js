let
    _ = require('underscore'),
    DBus = require('dbus');


let bus = DBus.getBus('session');
let spotify = {
    service: 'org.mpris.MediaPlayer2.spotify',
    objectPath: '/org/mpris/MediaPlayer2',
    // interface: 'org.mpris.MediaPlayer2.Player'
    interface: 'org.freedesktop.DBus.Properties'
};

bus.getInterface(spotify.service, spotify.objectPath, spotify.interface, (err, iface) => {

    if (err) {

        console.log(err);
        process.exit();
    } else {

        let lastState = null;
        iface.on('PropertiesChanged', (str, obj, arr) => {

            let newState = {
                artist: obj.Metadata['xesam:artist'][0],
                music: obj.Metadata['xesam:title'],
                album: obj.Metadata['xesam:album'],
                is_playing: obj.PlaybackStatus === 'Playing'
            };

            if (!_.isEqual(lastState, newState)) {
                console.log(newState);
                lastState = newState;
            }
        });
    }

});
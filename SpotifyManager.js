let
    _ = require('underscore'),
    DBus = require('dbus');


let bus = DBus.getBus('session');
let spotify = {
    service: 'org.mpris.MediaPlayer2.spotify',
    objectPath: '/org/mpris/MediaPlayer2',
    interfaces: [
        'org.mpris.MediaPlayer2.Player',
        'org.freedesktop.DBus.Properties',
        'org.freedesktop.Notifications'
    ]
};
let iconGetter = {
    service: ':1.32',
    objectPath: '/com/canonical/indicator/sound',
    interfaces: [
        'org.gtk.Actions'
    ]
};

let player = {
    nextTrack: null,
    prevTrack: null,
    playPause: null,
    stopTrack: null,
    currentTrack: null
}

let ifaceCallbackWrapper = (iface, method, callback) => {

    iface[method]((err) => {
        // TODO: Fix sync/async problems. Sometimes response callback is
        // is called before some changes be done, causing incosistence
        // in the response. Temporally solved using setTimeout() :v
        // The call order must be:
        //  - iface.on('propertyChanged')
        //  - iface.on('Changed')
        //  - this callback
        setTimeout(() => { callback(err, player.currentTrack) }, 400);
    });
};

// TODO: Find elegant way to solve this callback hell
// TODO: player.currentTrack actually shows to before-last one
let buildManager = (callback) => {

    bus.getInterface(iconGetter.service, iconGetter.objectPath, iconGetter.interfaces[0], (err, iface) => {

        if (err)
            callback(err, null);
        else {
            iface.on('Changed', (unused1, unused2, obj) => {
                try {
                    player.currentTrack.albumArt = obj['spotify.desktop']['art-url'];
                } catch (err) {
                    //TODO: Check when obj['spotify.desktop'] is undefined
                    console.log('Error');
                };
            });
        }
    });

    bus.getInterface(spotify.service, spotify.objectPath, spotify.interfaces[0], (err, iface) => {

        if (err)
            callback(err, null);
        else {

            player.nextTrack = (_callback) => { ifaceCallbackWrapper(iface, 'Next', _callback) };
            player.prevTrack = (_callback) => { ifaceCallbackWrapper(iface, 'Previous', _callback) };
            player.playPause = (_callback) => { ifaceCallbackWrapper(iface, 'PlayPause', _callback) };
            player.stopTrack = (_callback) => { ifaceCallbackWrapper(iface, 'Stop', _callback) };

            bus.getInterface(spotify.service, spotify.objectPath, spotify.interfaces[1], (err, _iface) => {

                if (err) {
                    callback(err, null);
                } else {

                    _iface.on('PropertiesChanged', (unused1, obj, unused2) => {

                        let newState = {
                            artist: obj.Metadata['xesam:artist'][0],
                            music: obj.Metadata['xesam:title'],
                            album: obj.Metadata['xesam:album'],
                            isPlaying: obj.PlaybackStatus === 'Playing'
                        };

                        if (!_.isEqual(player.currentTrack, newState))
                            player.currentTrack = newState;
                    });

                    callback(null, player);
                }
            });
        }
    });
};

module.exports = {
    buildManager
}
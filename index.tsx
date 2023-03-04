import JsSIP from 'jssip';
import {RTCPeerConnection, RTCSessionDescription} from 'react-native-webrtc';

const configuration = {
  uri: 'sip:user@example.com',
  password: 'secret',
  registrar_server: 'sip:example.com',
  mediaConstraints: {
    audio: true,
    video: false,
  },
};

const session = new JsSIP.Session(configuration);

const pc = new RTCPeerConnection({
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
});

pc.onaddstream = event => {
  // Handle incoming media stream
};

session.on('accepted', () => {
  // Send SDP offer
  pc.createOffer(
    description => {
      pc.setLocalDescription(description);
      session.send({
        body: description.sdp,
        contentType: 'application/sdp',
      });
    },
    error => {
      console.error(error);
    },
  );
});

session.on('peerconnection', e => {
  // Set remote description
  pc.setRemoteDescription(
    new RTCSessionDescription({
      type: 'answer',
      sdp: e.peerconnection.remoteDescription.sdp,
    }),
  );
});

// Start session
session.start();

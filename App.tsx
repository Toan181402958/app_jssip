/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import JsSIP from 'jssip';
import reactotron from 'reactotron-react-native';
if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

import {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

window.RTCPeerConnection = window.RTCPeerConnection || RTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || RTCIceCandidate;
window.RTCSessionDescription =
  window.RTCSessionDescription || RTCSessionDescription;
window.MediaStream = window.MediaStream || MediaStream;
window.MediaStreamTrack = window.MediaStreamTrack || MediaStreamTrack;
window.navigator.mediaDevices = window.navigator.mediaDevices || mediaDevices;
window.navigator.getUserMedia =
  window.navigator.getUserMedia || mediaDevices.getUserMedia;
function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [form, setForm] = useState({
    domain: '',
    account: '',
    pass: '',
  });
  const jsSIP = useRef(null);

  // const pc = new RTCPeerConnection({
  //   iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
  // });

  const options = {
    // eventHandlers: eventHandlers,
    mediaConstraints: {
      audio: true,
      video: false,
    },
    pcConfig: {
      rtcpMuxPolicy: 'negotiate',
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302'],
        },
      ],
    },
    rtcConfiguration: {
      sdpSemantics: 'plan-b',
      bundlePolicy: 'max-compat',
      rtcpMuxPolicy: 'negotiate',
    },
  };
  const submit = () => {
    console.log('form', form);
    var socket = new JsSIP.WebSocketInterface(
      'wss://vnsale.siptrunk.vn:58089/ws',
    );
    var config = {
      sockets: [socket],
      uri: 'sip:2007001@cms.siptrunk.vn',
      password: 'EZSale@!#2007001',
      domain: 'cms.siptrunk.vn',
      debug: true,
    };
    jsSIP.current = new JsSIP.UA(config);
    // var ua = new JsSIP.UA(config);
    // ua.o
    connect();
    jsSIP.current.start();
    var eventHandlers = {
      progress: function (e) {
        console.log('call is in progress');
      },
      failed: function (e) {
        console.log('call failed with cause: ' + e.data.cause);
      },
      ended: function (e) {
        console.log('call ended with cause: ' + e.data.cause);
      },
      confirmed: function (e) {
        console.log('call confirmed');
      },
    };

    var options = {
      eventHandlers: eventHandlers,
      mediaConstraints: {audio: true, video: true},
    };

    var session = jsSIP.current.call('sip:2007002@cms.siptrunk.vn', options);
  };

  const connect = () => {
    const callId = 'Test';
    jsSIP.current.on('connecting', data => {
      reactotron.log!('connecting', data);
    });
    jsSIP.current.on('connected', data => {
      reactotron.log!('connected', data);
    });
    jsSIP.current.on('disconnected', data => {
      reactotron.log!('disconnected', data);
    });
    jsSIP.current.on('registered', data => {
      reactotron.log!('registered', data);
    });
    jsSIP.current.on('unregistered', data => {
      reactotron.log!('unregistered', data);
    });
    jsSIP.current.on('registrationFailed', data => {
      reactotron.log!('registrationFailed', data);
    });
    jsSIP.current.on('registrationExpiring', data => {
      reactotron.log!('unregistered', data);
    });
    jsSIP.current.on('newRTCSession', data => {
      reactotron.log!('registrationFailed', data);
    });
    jsSIP.current.on('newMessage', data => {
      reactotron.log!('unregistered', data);
    });
    jsSIP.current.on('sipEvent', data => {
      reactotron.log!('registrationFailed', data);
    });

    // jsSIP.current.call(`sip:2007001@cms.siptrunk.vn`, {
    //   ...options,
    //   extraHeaders: [`X-ez_callId: ${callId}`],
    // });
  };
  const call = () => {
    jsSIP.current.stop();
  };
  const item = (title: String, onChangeText: (text: String) => void) => {
    return (
      <View style={styles.item}>
        <Text children={title} />
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          placeholder={'Enter'}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {item('Domain', text => setForm({...form, domain: text}))}
      {item('Account', text => setForm({...form, account: text}))}
      {item('Pass', text => setForm({...form, pass: text}))}
      <TouchableOpacity
        onPress={submit}
        style={styles.btn}
        children={<Text style={{color: 'white'}} children={'Enter'} />}
      />
      <TouchableOpacity
        onPress={call}
        style={styles.btn}
        children={<Text style={{color: 'white'}} children={'Call'} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  item: {
    marginBottom: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  input: {
    width: '100%',
    minHeight: 44,
    backgroundColor: 'white',
    marginTop: 10,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  btn: {
    width: '70%',
    backgroundColor: 'blue',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    marginHorizontal: 40,
  },
});

export default App;

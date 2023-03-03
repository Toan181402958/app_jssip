import JsSIP from "jssip";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { sendCallBroadCast, sendClientBroadCast } from "../utils";
import JsSIPUtil from "./JsSIPUtil";
const PROVIDER_NAME = "ITY";
function JsSipCallClient(props, ref) {
  const jsSIPclient = useRef(null);
  const jsSIPCall = useRef(null);
  const domain = useRef(null);

  let remoteAudio;
  JsSIP.debug.enable("JsSIP:*");
  JsSIP.debug.disable("JsSIP:*");
  useImperativeHandle(ref, () => ({
    login,
    makeCall,
  }));

  const login = async () => {
    if (jsSIPclient.current) {
      jsSIPclient.current.stop();
    }
    // call api and get login info
    domain.current = "cms.siptrunk.vn";
    const configuration = {
      domain: domain.current,
      sockets: [
        new JsSIP.WebSocketInterface(`wss://vnsale.siptrunk.vn:58089/ws`),
      ],
      uri: `sip:2007001@cms.siptrunk.vn`,
      password: "EZSale@!#2007001",
      session_timers: false,
      debug: true,
    };
    jsSIPclient.current = new JsSIP.UA(configuration);
    clientEventHandlers();
    jsSIPclient.current.start();
  };

  const makeCall = async (destination) => {
    // call api to get call_id
    const callId = "Test";

    const call = jsSIPclient.current.call(
      `sip:${destination}@${domain.current}`,
      {
        ...options,
        extraHeaders: [`X-ez_callId: ${callId}`],
      }
    );
    if (jsSIPCall.current) {
      // release or end call before update
    }
    jsSIPCall.current = call;
    JsSIPUtil.jsSIPCall = call;
    callEventHandlers(call);
  };

  const eventHandlers = {
    peerconnection: function (e) {
      console.log("call is in peerconnection", { e });
    },
    connecting: function (data) {
      console.log("call is in connecting", { data });
      sendCallBroadCast({
        name: PROVIDER_NAME,
        status: "connecting",
        data: data.request.call_id,
      });
    },
    sending: function (e) {
      console.log("call is in sending", { e });
    },
    progress: function (e) {
      console.log("call is in progress", { e });
    },
    accepted: function (e) {
      console.log("call is in accepted", { e });
    },
    confirmed: function (e) {
      console.log("call is in confirmed", { e });
    },
    ended: function (e) {
      console.log("call is in ended", { e });
    },
    failed: function (e) {
      console.log("call is in failed", { e });
    },
    newDTMF: function (e) {
      console.log("call is in newDTMF", { e });
    },
    newInfo: function (e) {
      console.log("call is in newInfo", { e });
    },
    hold: function (e) {
      console.log("call is in hold", { e });
    },
    unhold: function (e) {
      console.log("call is in unhold", { e });
    },
    muted: function (e) {
      console.log("call is in muted", { e });
    },
    unmuted: function (e) {
      console.log("call is in unmuted", { e });
    },
    reinvite: function (e) {
      console.log("call is in reinvite", { e });
    },
    refer: function (e) {
      console.log("call is in refer", { e });
    },
    replaces: function (e) {
      console.log("call is in replaces", { e });
    },
    sdp: function (e) {
      console.log("call is in sdp", { e });
    },
    icecandicandidate: function (e) {
      console.log("call is in icecandidate", { e });
    },
    getusermediafailed: function (e) {
      console.log("call is in getusermediafailed", { e });
    },
  };

  const options = {
    eventHandlers: eventHandlers,
    mediaConstraints: {
      audio: true,
      video: false,
    },
    render: {
      remote: document.getElementById("remoteAudio"),
    },
    pcConfig: {
      rtcpMuxPolicy: "negotiate",
      iceServers: [
        {
          urls: ["stun:stun4.l.google.com:19302"],
        },
      ],
    },
    rtcConfiguration: {
      sdpSemantics: "plan-b",
      bundlePolicy: "max-compat",
      rtcpMuxPolicy: "negotiate",
    },
  };

  // call events
  const callEventHandlers = (call) => {
    call.connection.addEventListener("addstream", function (e) {
      // Or addtrack
      console.log("addStream", { e });
      remoteAudio = document.createElement("audio");
      remoteAudio.srcObject = e.stream;
      remoteAudio.play();
    });
    call.on("accepted", function (data) {
      console.log("=====accepted", { e: data });
      sendCallBroadCast({
        name: PROVIDER_NAME,
        status: "accepted",
        data,
      });
    });
    call.on("failed", function (data) {
      console.log("=====failed", { e: data });
      sendCallBroadCast({
        name: PROVIDER_NAME,
        status: "failed",
        data,
      });
    });
    call.on("progress", function (data) {
      console.log("======progress", { data });
      sendCallBroadCast({
        name: PROVIDER_NAME,
        status: "progress",
        data,
      });
    });
    call.on("confirmed", function (data) {
      console.log("======confirmed", { e: data });
      sendCallBroadCast({
        name: PROVIDER_NAME,
        status: "confirmed",
        data,
      });
    });
    call.on("ended", function (data) {
      console.log("======ended", { e: data });
      sendCallBroadCast({
        name: PROVIDER_NAME,
        status: "ended",
        data: data.cause,
      });
    });
    call.on("icecandidate", function (event) {
      console.log("======icecandidate", { event });
      if (
        event.candidate.type === "srflx" &&
        event.candidate.relatedAddress !== null &&
        event.candidate.relatedPort !== null
      ) {
        event.ready();
        console.log("======icecandidate ready", { event });
      }
    });
  };

  // Client events
  const clientEventHandlers = () => {
    jsSIPclient.current?.on("connecting", (data) => {
      console.log("connecting", { data });
      sendClientBroadCast({
        name: PROVIDER_NAME,
        status: "connecting",
        data: {},
      });
    });

    jsSIPclient.current?.on("connected", (data) => {
      console.log("connected", { data });
      sendClientBroadCast({
        name: PROVIDER_NAME,
        status: "connected",
        data: {},
      });
    });

    jsSIPclient.current?.on("disconnected", (data) => {
      console.log("disconnected", { data });
      sendClientBroadCast({
        name: PROVIDER_NAME,
        status: "disconnected",
        data: {},
      });
    });

    jsSIPclient.current?.on("registered", (sipEvent) => {
      console.log("registered");
      sendClientBroadCast({
        name: PROVIDER_NAME,
        status: "logged_in",
        data: sipEvent,
      });
    });
    jsSIPclient.current?.on("unregistered", (data) => {
      console.log("unregistered", { data });
    });

    jsSIPclient.current?.on("registrationFailed", (data) => {
      console.log("registrationFailed", { data });
      sendClientBroadCast({
        name: PROVIDER_NAME,
        status: "login_failed",
        data,
      });
    });

    jsSIPclient.current?.on("registrationExpiring", (data) => {
      console.log("registrationExpiring", { data });
    });

    jsSIPclient.current?.on("newRTCSession", (newRTCSession) => {
      console.log("newRTCSession", { newRTCSession });
      const session = newRTCSession.session;
      session.on("progress", (message) => {
        console.log("progress session ", message.response.status_code);
        // Chưa bao giờ trả về 180 không biết do server hay client cấu hình thiếu
        // Dùng tạm code 183 thay cho ringing
        if (message.response.status_code === 180) {
          //RINGING EXAMPLE
          //put your code here
        }
      });
    });

    jsSIPclient.current?.on("newMessage", (data) => {
      console.log("newMessage", { data });
    });

    jsSIPclient.current?.on("sipEvent", (sipEvent) => {
      console.log("sipEvent", { sipEvent });
    });
  };

  return (
    <>
      <h1>Wrap JSSIP</h1>
    </>
  );
}

export default forwardRef(JsSipCallClient);

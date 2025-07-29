import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  PhoneXMarkIcon,
} from "@heroicons/react/16/solid";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/authContext";
import { useParams } from "react-router";

interface Props {
  roomId: string | undefined;
}

const socket: Socket = io("http://localhost:8000");

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const VideoCall: React.FC<Props> = ({ roomId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteSocketId = useRef<string | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [remoteStreamAvailable, setRemoteStreamAvailable] = useState(false);

  useEffect(() => {
    const start = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      socket.emit("join", roomId);

      socket.on("user-joined", async (otherUserId: string) => {
        remoteSocketId.current = otherUserId;
        createPeer(localStream, otherUserId, true); // create offer
      });

      socket.on("offer", async ({ from, offer }) => {
        remoteSocketId.current = from;
        createPeer(localStream, from, false, offer); // answer back
      });

      socket.on("answer", async ({ answer }) => {
        await peerRef.current?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      // Listen for remote ICE candidates and add them to the local RTCPeerConnection
      socket.on("ice-candidate", async ({ candidate }) => {
        if (candidate) {
          await peerRef.current?.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      });
    };

    start();

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const createPeer = async (
    localStream: MediaStream,
    otherUserId: string,
    isCaller: boolean,
    offer?: RTCSessionDescriptionInit
  ) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerRef.current = pc;

    // Add local tracks to peer
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Send ICE candidate : Listen for local ICE candidates on the local RTCPeerConnection
    pc.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId.current) {
        socket.emit("ice-candidate", {
          to: remoteSocketId.current,
          candidate: event.candidate,
        });
      }
    };

    // Set remote video
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteStreamAvailable(true);
      }
    };

    // Offer/Answer logic
    if (isCaller) {
      const createdOffer = await pc.createOffer();
      await pc.setLocalDescription(createdOffer);
      socket.emit("offer", {
        to: otherUserId,
        offer: createdOffer,
      });
    } else if (offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const createdAnswer = await pc.createAnswer();
      await pc.setLocalDescription(createdAnswer);
      socket.emit("answer", {
        to: otherUserId,
        answer: createdAnswer,
      });
    }
  };

  const toggleMic = async () => {
    if (isMicOn) {
      // 🔇 Turn off mic: stop track and remove it from peer connection
      localStreamRef.current?.getAudioTracks().forEach((track) => {
        track.stop();
        if (peerRef.current) {
          const senders = peerRef.current.getSenders();
          const audioSender = senders.find(
            (sender) => sender.track?.kind === "audio"
          );
          if (audioSender) {
            peerRef.current.removeTrack(audioSender);
          }
        }
      });

      setIsMicOn(false);
    } else {
      try {
        // 🎤 Turn mic back on: get new stream and reattach audio track
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });

        const audioTrack = stream.getAudioTracks()[0];

        // Replace or add audio track in peer connection
        if (peerRef.current) {
          const senders = peerRef.current.getSenders();
          const audioSender = senders.find(
            (sender) => sender.track?.kind === "audio"
          );

          if (audioSender) {
            await audioSender.replaceTrack(audioTrack);
          } else {
            peerRef.current.addTrack(audioTrack, stream);
          }
        }

        // Update refs
        if (!localStreamRef.current) {
          localStreamRef.current = new MediaStream();
        }

        localStreamRef.current.addTrack(audioTrack);
        setIsMicOn(true);
      } catch (err) {
        console.error("Error turning mic back on:", err);
      }
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      // 🔴 Turn camera off — stop tracks and remove from peer connection
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.stop();
        if (peerRef.current) {
          const senders = peerRef.current.getSenders();
          const videoSender = senders.find(
            (sender) => sender.track?.kind === "video"
          );
          if (videoSender) {
            peerRef.current.removeTrack(videoSender);
          }
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      setIsCameraOn(false);
    } else {
      try {
        // 🟢 Turn camera back on
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        const videoTrack = stream.getVideoTracks()[0];

        // Replace or add video track in peer connection
        if (peerRef.current) {
          const senders = peerRef.current.getSenders();
          const videoSender = senders.find(
            (sender) => sender.track?.kind === "video"
          );

          if (videoSender) {
            await videoSender.replaceTrack(videoTrack);
          } else {
            peerRef.current.addTrack(videoTrack, stream);
          }
        }

        // Update refs and UI
        localStreamRef.current?.removeTrack(
          localStreamRef.current.getVideoTracks()[0]
        );
        localStreamRef.current?.addTrack(videoTrack);
        localVideoRef.current!.srcObject = stream;
        localStreamRef.current = stream;

        setIsCameraOn(true);
      } catch (err) {
        console.error("Error restarting camera:", err);
      }
    }
  };

  const endCall = () => {
    peerRef.current?.close();
    peerRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    socket.disconnect();
  };

  const { user } = useAuth();
  const { meetingId } = useParams();

  return (
    <div className="w-full h-full flex-1 flex justify-center align-middle flex-col">
      <div className="flex flex-1 w-full items-center justify-center gap-6 px-4">
        <div className="grid grid-flow-col items-center">
          <div className="relative">
            <span className="absolute top-2 left-4 text-white">
              {user?.name}
            </span>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className=" object-cover rounded-xl bg-black"
            />
          </div>
        </div>
        {remoteStreamAvailable && (
          <div className="flex flex-col items-center">
            <span className="text-white text-sm mb-1">Guest</span>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-[480px] h-[360px] object-cover rounded-xl bg-black"
            />
          </div>
        )}
      </div>

      <div className="bg-white p-2 md:p-4 rounded-2xl inline-flex md:flex flex-col md:flex-row items-center justify-between w-[90%] mx-auto shadow-md">
        {user?.name && (
          <div className="hidden md:flex items-center gap-3 text-md text-gray-700 mb-3 md:mb-0">
            <span>
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <div className="w-px h-5 bg-gray-900 mx-2" />
            <span className="font-medium text-sm max-w-[230px]">
              {meetingId}
            </span>
          </div>
        )}

        <div className="flex gap-5">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full shadow transition-colors duration-200 ${
              isMicOn
                ? "bg-green-100 hover:bg-green-200"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <MicrophoneIcon
              className={`w-6 h-6 ${
                isMicOn ? "text-green-600" : "text-gray-600"
              }`}
            />
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full shadow transition-colors duration-200 ${
              isCameraOn
                ? "bg-blue-100 hover:bg-blue-200"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {isCameraOn ? (
              <VideoCameraIcon className="w-6 h-6 text-blue-600" />
            ) : (
              <VideoCameraSlashIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-100 hover:bg-red-200 shadow transition-colors duration-200"
          >
            <PhoneXMarkIcon className="w-6 h-6 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

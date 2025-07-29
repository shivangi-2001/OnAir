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
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
  ],
};

const VideoCall: React.FC<Props> = ({ roomId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const emailToSocket = useRef<Map<string, string>>(new Map());

  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const { user } = useAuth();
  const { meetingId } = useParams();

  const createPeerConnection = (userId: string): RTCPeerConnection => {
    if (peerConnections.current.has(userId)) {
      return peerConnections.current.get(userId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          type: "ice-candidate",
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream) {
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.set(userId, remoteStream);
          return updated;
        });
      }
    };

    peerConnections.current.set(userId, pc);
    return pc;
  };

  const cleanupOldSocket = (email: string) => {
    const oldSocketId = emailToSocket.current.get(email);
    if (oldSocketId) {
      peerConnections.current.get(oldSocketId)?.close();
      peerConnections.current.delete(oldSocketId);
      // setRemoteStreams((prev) => {
      //   const updated = new Map(prev);
      //   updated.delete(oldSocketId);
      //   return updated;
      // });
      setUserNames((prev) => {
        console.log(prev);
        const updated = new Map(prev);
        updated.delete(oldSocketId);
        return updated;
      });
    }
  };

  const handleOffer = async (from: string, offer: RTCSessionDescriptionInit, stream: MediaStream) => {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (pc.getSenders().length === 0) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }
    socket.emit("signal", { type: "answer", to: from, answer });
  };

  const handleAnswer = async (from: string, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnections.current.get(from);
    if (pc && pc.signalingState === "have-local-offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (from: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(from);
    if (pc && candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };



  console.log("remote video: ",remoteStreams);
  console.log("name: ",userNames);

  useEffect(() => {
    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      socket.emit("join", { roomId, name: user?.name, email: user?.email });

      socket.on("all-users", (users: { socketId: string; name: string; email: string }[]) => {
        const nameMap = new Map(userNames);
        users.forEach(({ socketId, name, email }) => {
          cleanupOldSocket(email);
          emailToSocket.current.set(email, socketId);
          const pc = createPeerConnection(socketId);
          if (pc.getSenders().length === 0) {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          }
          pc.createOffer().then((offer) => {
            pc.setLocalDescription(offer);
            socket.emit("signal", { type: "offer", to: socketId, offer });
          });
          nameMap.set(socketId, name);
        });
        setUserNames(nameMap);
      });

      socket.on("user-joined", ({ socketId, name, email }) => {
        cleanupOldSocket(email);
        emailToSocket.current.set(email, socketId);
        const pc = createPeerConnection(socketId);

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pc.createOffer().then((offer) => {
          pc.setLocalDescription(offer);
          socket.emit("signal", { type: "offer", to: socketId, offer });
        });
        setUserNames((prev) => new Map(prev).set(socketId, name));
      });

      socket.on("signal", async (data) => {
        const { type, from, offer, answer, candidate } = data;
        switch (type) {
          case "offer":
            await handleOffer(from, offer, stream);
            break;
          case "answer":
            await handleAnswer(from, answer);
            break;
          case "ice-candidate":
            await handleIceCandidate(from, candidate);
            break;
          default:
            console.warn("Unknown signal type:", type);
        }
      });

      socket.on("user-left", (leftSocketId: string) => {
        peerConnections.current.get(leftSocketId)?.close();
        peerConnections.current.delete(leftSocketId);
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.delete(leftSocketId);
          return updated;
        });
        setUserNames((prev) => {
          const updated = new Map(prev);
          updated.delete(leftSocketId);
          return updated;
        });
      });

      socket.on("disconnect", () => {
        peerConnections.current.forEach((pc) => pc.close());
        peerConnections.current.clear();
        setRemoteStreams(new Map());
        setUserNames(new Map());
        emailToSocket.current.clear();
      });
    };

    start();

    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      socket.disconnect();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId]);

  const toggleMic = async () => {
    if (!localStreamRef.current) return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    if (isMicOn) {
      audioTracks.forEach((track) => track.stop());
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (sender) pc.removeTrack(sender);
      });
      setIsMicOn(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const newAudioTrack = newStream.getAudioTracks()[0];
        localStreamRef.current.addTrack(newAudioTrack);
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
          if (sender) {
            sender.replaceTrack(newAudioTrack);
          } else {
            pc.addTrack(newAudioTrack, localStreamRef.current!);
          }
        });
        setIsMicOn(true);
      } catch (err) {
        console.error("Error enabling mic:", err);
      }
    }
  };


  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn OFF
      const videoTracks = localStreamRef.current?.getVideoTracks();
      videoTracks?.forEach((track) => track.stop());

      peerConnections.current.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) pc.removeTrack(videoSender);
      });

      localVideoRef.current!.srcObject = null;
      setIsCameraOn(false);
    } else {
      // Turn ON
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const videoTrack = stream.getVideoTracks()[0];

        peerConnections.current.forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === "video");

          if (videoSender) {
            videoSender.replaceTrack(videoTrack);
          } else {
            pc.addTrack(videoTrack, stream);
          }
        });

        localStreamRef.current?.addTrack(videoTrack);
        localVideoRef.current!.srcObject = stream;
        localStreamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error("Camera ON error", err);
      }
    }
  };
  
  const endCall = () => {};

  return (
    <div className="w-full h-full flex-1 flex justify-center align-middle flex-col pb-5">
      <div className="flex flex-1 w-full items-center justify-center gap-6 px-4">
        <div className="grid grid-flow-col items-center">
          <div className="relative">
            <span className="absolute top-2 left-4 text-white">{user?.name}</span>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="object-cover rounded-xl bg-black w-full"
            />
          </div>
        </div>
        {[...remoteStreams.entries()].map(([userId, stream]) => (
          <div key={userId} className="relative">
            <span className="absolute top-2 left-4 text-white">
              {userNames.get(userId) ?? userId}
            </span>
            <video
              autoPlay
              playsInline
              muted
              className="object-cover rounded-xl bg-black w-[400px] h-[300px]"
              ref={(video) => {
                if (video && !video.srcObject) video.srcObject = stream;
              }}
            />
          </div>
        ))}
      </div>
      <div className="bg-white p-2 md:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between w-[80%] mx-auto shadow-md">
        {user?.name && (
          <div className="hidden md:flex items-center gap-3 text-md text-gray-700 mb-3 md:mb-0">
            <span>
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="w-px h-5 bg-gray-900 mx-2" />
            <span className="font-medium text-sm max-w-[230px]">{meetingId}</span>
          </div>
        )}
        <div className="flex gap-5">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full shadow transition-colors duration-200 ${
              isMicOn ? "bg-green-100 hover:bg-green-200" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <MicrophoneIcon className={`w-6 h-6 ${isMicOn ? "text-green-600" : "text-gray-600"}`} />
          </button>
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full shadow transition-colors duration-200 ${
              isCameraOn ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-200 hover:bg-gray-300"
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

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/authContext";
import { useParams } from "react-router-dom";
import socket from "../context/socket";

const VideoCall = () => {
  const { user } = useAuth();
  const { meetingId } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      socket.emit("join-room", { meetingId, user });

      socket.on("user-joined", async ({ socketId, user: joinedUser }) => {
        const pc = createPeerConnection(socketId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { target: socketId, offer });
        peersRef.current[socketId] = pc;
      });

      socket.on("offer", async ({ from, offer }) => {
        const pc = createPeerConnection(from);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { target: from, answer });
        peersRef.current[from] = pc;
      });

      socket.on("answer", async ({ from, answer }) => {
        await peersRef.current[from]?.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async ({ from, candidate }) => {
        try {
          await peersRef.current[from]?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      });

      socket.on("user-left", ({ socketId }) => {
        peersRef.current[socketId]?.close();
        delete peersRef.current[socketId];
        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[socketId];
          return updated;
        });
      });

      socket.on("meeting-ended", () => {
        window.location.href = "/";
      });
    };

    init();
  }, [meetingId]);

  const createPeerConnection = (socketId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { target: socketId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [socketId]: e.streams[0] }));
    };

    return pc;
  };

  const endMeeting = () => {
    socket.emit("end-meeting");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white">Video Call</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded-md border" />
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <video
            key={id}
            autoPlay
            playsInline
            ref={(el) => {
              if (el) el.srcObject = stream;
            }}
            className="w-full rounded-md border"
          />
        ))}
      </div>
      <button onClick={endMeeting} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
        End Meeting
      </button>
    </div>
  );
};

export default VideoCall;

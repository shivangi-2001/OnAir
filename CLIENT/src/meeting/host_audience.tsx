const HostParticipants = () => {

  return (
    <div className="w-1/4 bg-white border-l border-gray-300 p-4 shadow-inner overflow-y-auto">
      {/* Host section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 border-gray-300">
          👁️ Host
        </h2>
        {host?.email && (
          <div className="inline-flex items-center gap-4 bg-gray-100 w-full p-3 rounded-md">
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={
                host.profile ||
                "https://images.unsplash.com/photo-1619417612216-2b8afd7e86e4?w=900&auto=format&fit=crop&q=60"
              }
              alt="Host Avatar"
            />
            <div>
              <div className="font-medium">{host.name}</div>
              <div className="text-sm text-gray-500">{host.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Participants */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 border-gray-300 mb-2">
          👥 Participants ({participants.length})
        </h2>
        {participants && participants.length === 0 ? (
          <p className="text-gray-500 italic">No participants yet.</p>
        ) : (
          <ul className="space-y-3">
            {participants && participants.map((participant, index) => (
              <li
                key={index}
                className="flex items-center gap-4 bg-gray-50 p-2 rounded-md"
              >
                <img
                  src={
                    participant.profile ||
                    "https://api.dicebear.com/6.x/initials/svg?seed=User"
                  }
                  alt="Participant Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-gray-800">
                    {participant.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {participant.email}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HostParticipants;

const express = require("express");
const router = express.Router();
const { User } = require("../model/user");
const { Meeting } = require("../model/meeting");
const { v4: uuid } = require("uuid");
const { authenticate } = require("../middleware/auth");
const getProfileImageUrl = require("../utils/get_image_url");

function formatTime(date) {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
}
  
function formatDuration(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

router.post("/instant_link", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(400).json({ message: "User not found" });

    const meeting_id = uuid();

    const { timezone } = req.body;
    if(!timezone) return res.status(400).json({ message: "Timezone not found" });
    
    const newMeeting = new Meeting({
      host: user._id,
      meetingId: meeting_id,
      timezone: timezone
    });

    await newMeeting.save();

    res.status(201).json({ meetingId: meeting_id, host: { name: user.name, email: user.email, profile: getProfileImageUrl(user.profilePicture) } });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


  
router.get("/:meetingId", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.sub);
        if (!user) return res.status(404).json({ message: "User not found" });
    
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId })
            .populate("host", "name email") // return host name/email
            .populate("audiences", "name email"); // return audience list
    
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });
        if (meeting.endedAt) return res.status(410).json({ message: "Meeting has ended" });
  
        const now = new Date();
        const startTimeFormatted = formatTime(meeting.createdAt);
    
        let durationSeconds = Math.floor((now - meeting.createdAt) / 1000);
        let durationFormatted = formatDuration(durationSeconds);
    
        return res.status(200).json({
            host: meeting.host,
            isHost: meeting?.host?.email === user?.email,
            meetingId: meeting.meetingId,
            startTime: startTimeFormatted,
            duration: durationFormatted,
            audiences: meeting.audiences,
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// In routes/meeting.js
router.post("/:meetingId/join", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if(meeting.endedAt != null) return res.status(404).json({ message: "Meeting is already ended" });

    // Add user only once
    if (!meeting.audiences.includes(user._id)) {
      meeting.audiences.push(user._id);
      await meeting.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/end", authenticate, async (req, res) => {
  try {
    const meetingId = req.params.id;

    // Get meeting and populate host info
    const meeting = await Meeting.findOne({ meetingId }).populate("host");
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Check if the authenticated user is the host
    if (meeting.host._id.toString() !== req.user.sub) {
      return res.status(403).json({ message: "Only host can end the meeting" });
    }

    // End meeting
    const endedAt = new Date();
    const duration = Math.floor((endedAt - meeting.createdAt) / 1000);
    meeting.endedAt = endedAt;
    meeting.duration = duration;

    await meeting.save();

    res.status(200).json({ message: "Meeting ended", duration });
  } catch (err) {
    console.error("Failed to end meeting:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/schedule_meeting", authenticate, )


module.exports = router;

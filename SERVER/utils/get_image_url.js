function getProfileImageUrl(profilePicture) {
    if (!profilePicture) {
      return "https://images.unsplash.com/photo-1619417612216-2b8afd7e86e4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMHx8fGVufDB8fHx8fA%3D%3D";
    }
  
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
      return profilePicture;
    }
  
    return `http://localhost:8000/uploads/${profilePicture}`;
  }

module.exports = getProfileImageUrl;

export const generateMeetLink = () => {
  // Generate a random meeting ID using a combination of timestamp and random string
  const meetingId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  return `https://meet.google.com/${meetingId}`;
};

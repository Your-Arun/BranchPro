import axios from "axios";

/**
 * Send a push notification via Expo Push API
 * @param {string|string[]} tokens - Expo push token(s)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Extra data for the app
 */
export const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (!tokens) return;
  
  const pushTokens = Array.isArray(tokens) ? tokens : [tokens];
  const validTokens = pushTokens.filter(t => t && t.startsWith("ExponentPushToken"));
  
  if (validTokens.length === 0) return;

  const messages = validTokens.map(token => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }));

  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", messages, {
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending push notification:", error.response?.data || error.message);
    return null;
  }
};

export async function sendTeamsNotification(payload: {
  title: string;
  summary: string;
  text: string;
}) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title,
        summary: payload.summary,
        text: payload.text
      })
    });
  } catch (error) {
    console.error("Teams webhook failed", error);
  }
}

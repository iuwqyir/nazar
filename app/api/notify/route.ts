const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

export async function POST(request: Request): Promise<Response> {
  const notifyApiSecret = process.env.NOTIFY_API_SECRET;
  if (!notifyApiSecret) {
    throw new Error("You need to provide NOTIFY_API_SECRET env variable");
  }

  const notificationPayload = request.body;

  try {
    const res = await fetch(
      `https://notify.walletconnect.com/${projectId}/notify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${notifyApiSecret}`,
        },
        body: JSON.stringify(notificationPayload),
      }
    );

    const data = await res.json()
 
    return Response.json(data)
} catch (error: any) {
    return Response.json({
      success: false,
      message: error?.message ?? "Internal server error",
    });
  }
}

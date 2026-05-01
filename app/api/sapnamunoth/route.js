export async function POST(request) {
  try {
    const body = await request.json();

    const scriptUrl = process.env.GOOGLE_SCRIPT_SAPNA_URL;

    if (!scriptUrl) {
      return Response.json(
        { success: false, error: "Missing GOOGLE_SCRIPT_SAPNA_URL" },
        { status: 500 }
      );
    }

    const googleResponse = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    const text = await googleResponse.text();

    return Response.json({
      success: true,
      googleResponse: text,
    });
  } catch (error) {
    console.error("Sapna Munoth API error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to submit Sapna Munoth style finder form",
      },
      { status: 500 }
    );
  }
}

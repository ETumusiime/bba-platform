export async function POST(req) {
  try {
    const body = await req.json();

    // Simulate a successful payment initialization response
    return new Response(
      JSON.stringify({
        ok: true,
        message: "✅ Test payment initialized successfully",
        echo: body || null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e?.message || "❌ Unknown error during test payment",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

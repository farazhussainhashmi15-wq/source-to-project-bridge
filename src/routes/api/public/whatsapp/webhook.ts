import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest, WebhookError } from "@lovable.dev/webhooks-js";

// WhatsApp Business app history chunks reach 3 MB, above the library's 1 MiB default.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["WHATSAPP_API_KEY"];
        if (!secret) {
          return Response.json({ error: "WhatsApp is not configured" }, { status: 500 });
        }

        let verified: Awaited<ReturnType<typeof verifyWebhookRequest>>;
        try {
          verified = await verifyWebhookRequest({ req: request, secret, maxBodyBytes: MAX_BODY_BYTES });
        } catch (error) {
          const status = error instanceof WebhookError && error.code === "missing_secret" ? 500 : 401;
          console.error(`WhatsApp webhook verification failed: ${String(error)}`);
          return Response.json({ error: "Invalid webhook delivery" }, { status });
        }

        const deliveryId = request.headers.get("x-lovable-delivery")?.trim();
        const event = request.headers.get("x-lovable-event")?.trim();
        if (!deliveryId || !event) {
          return Response.json({ error: "Missing delivery or event header" }, { status: 400 });
        }

        try {
          const { receiveEvent } = await import("@/lib/whatsapp/webhook-processor.server");
          await receiveEvent({ deliveryId, event, payload: verified.payload });
        } catch (error) {
          // 5xx so the gateway retries this delivery with the same delivery id.
          console.error(`WhatsApp webhook processing failed: ${String(error)}`);
          return Response.json({ error: "Processing failed" }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

import {
  isValidPaystackSignature,
  markOrderPaid,
  type PaystackVerifyData,
} from "@/functions/paystack.server";

// Paystack → Settings → API Keys & Webhooks → Webhook URL: https://<your-site>/api/paystack/webhook
export const Route = createFileRoute("/api/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const valid = await isValidPaystackSignature(
          rawBody,
          request.headers.get("x-paystack-signature"),
        );
        if (!valid) return new Response("Invalid signature", { status: 401 });

        const event = JSON.parse(rawBody) as { event: string; data: PaystackVerifyData };
        if (event.event === "charge.success") {
          await markOrderPaid(event.data.reference, event.data);
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});

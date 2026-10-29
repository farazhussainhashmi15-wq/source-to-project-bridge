import { describe, expect, it } from "vitest";

import {
  collectMessageObjects,
  extractChangeValue,
  isSameNumber,
  mediaInfo,
  shouldAdvanceStatus,
  statusRank,
  textContent,
  timestampToIso,
} from "@/lib/whatsapp/parse";

// Pure webhook-parsing rules. These guard what gets stored and who may be
// auto-replied to, so each one can genuinely fail.
describe("WhatsApp webhook parsing", () => {
  it("keeps an older sent callback from overwriting delivered or read", () => {
    expect(shouldAdvanceStatus("delivered", "sent")).toBe(false);
    expect(shouldAdvanceStatus("read", "delivered")).toBe(false);
    expect(shouldAdvanceStatus("sent", "delivered")).toBe(true);
    expect(shouldAdvanceStatus("pending", "accepted")).toBe(true);
    expect(statusRank("read")).toBeGreaterThan(statusRank("sent"));
  });

  it("only marks a message failed before the customer has read it", () => {
    expect(shouldAdvanceStatus("pending", "failed")).toBe(true);
    expect(shouldAdvanceStatus("sent", "failed")).toBe(true);
    expect(shouldAdvanceStatus("delivered", "failed")).toBe(false);
    expect(shouldAdvanceStatus("read", "failed")).toBe(false);
  });

  it("matches the business number in local and international form", () => {
    // Auto-replies must never go back to the business's own number (0314 2763051).
    expect(isSameNumber("+92 314 2763051", "923142763051")).toBe(true);
    expect(isSameNumber("0314 2763051", "923142763051")).toBe(true);
    expect(isSameNumber("923142763051", "923001234567")).toBe(false);
    expect(isSameNumber("923142763051", null)).toBe(false);
  });

  it("reads the single change value out of Meta's webhook body", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [{ changes: [{ field: "messages", value: { messages: [{ id: "wamid.1" }] } }] }],
    };
    expect(extractChangeValue(payload)).toEqual({ messages: [{ id: "wamid.1" }] });
    expect(extractChangeValue({})).toBeNull();
  });

  it("finds messages nested inside imported history threads", () => {
    const value = {
      history: [
        {
          type: "history",
          threads: [[{ id: "wamid.a", from: "923001112222", to: "923142763051" }]],
        },
      ],
    };
    const messages = collectMessageObjects(value);
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe("wamid.a");
  });

  it("converts Meta's unix seconds into an ISO timestamp", () => {
    expect(timestampToIso(1700000000)).toBe(new Date(1700000000 * 1000).toISOString());
    expect(timestampToIso("1700000000")).toBe(new Date(1700000000 * 1000).toISOString());
    expect(timestampToIso(undefined)).toBeNull();
  });

  it("keeps the media id and caption from an inbound photo", () => {
    const message = {
      type: "image",
      image: { id: "media-99", mime_type: "image/jpeg", caption: "our banner" },
    };
    expect(mediaInfo(message)).toMatchObject({
      mediaId: "media-99",
      mediaMime: "image/jpeg",
      caption: "our banner",
    });
  });

  it("reads the reply text of a button message", () => {
    expect(
      textContent({
        type: "interactive",
        interactive: { type: "button_reply", button_reply: { title: "SEO" } },
      }),
    ).toBe("SEO");
    expect(textContent({ type: "text", text: { body: "hi" } })).toBe("hi");
    expect(textContent({ type: "sticker", sticker: { id: "s1" } })).toBeNull();
  });
});

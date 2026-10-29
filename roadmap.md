# Roadmap

## Waiting on the user
- [ ] Past chats + contacts import — WhatsApp accepted the request, but nothing arrived in about 6 minutes. The number's "Incoming messages" destination must be set to this project (Connectors → WhatsApp → the connection → Incoming messages); then the import can be requested again inside the 24-hour window.

- [ ] Sync the project code to GitHub — must be started in Lovable's own settings (Project settings → Git); the agent cannot connect a repository.
- [ ] Confirm the auto-reply wording (currently placeholder copy) and decide what approved message templates to create for anything sent outside the 24-hour window.

## Done
- [x] WhatsApp connected to 0314 2763051; Lovable Cloud enabled so messages have durable storage.
- [x] Receiver live at /api/public/whatsapp/webhook — verifies every delivery, stores it durably, ignores replays, saves messages, parks delivery callbacks that arrive before their send record, auto-replies to customer messages and never to the business's own number. Verified end to end with signed test deliveries; test rows removed.
- [x] KBG logo in the header and as the site icon.
- [x] Every WhatsApp button opens wa.me/923142763051 in a new tab.

## Notes
- Auto-reply copy lives in src/lib/whatsapp/webhook-processor.server.ts as AUTO_REPLY_TEXT.
- No approved WhatsApp templates exist yet; Meta review can take up to 48 hours.
- The project's code is stored only in Lovable's own storage; no GitHub repository is linked.

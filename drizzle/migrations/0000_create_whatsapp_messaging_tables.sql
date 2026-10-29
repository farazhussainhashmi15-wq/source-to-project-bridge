-- Durable inbox for every verified WhatsApp webhook delivery from Meta.
CREATE TABLE public.whatsapp_webhook_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id text NOT NULL UNIQUE,
  event text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text,
  attempts integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX whatsapp_events_pending_idx
  ON public.whatsapp_webhook_events (next_retry_at)
  WHERE processed_at IS NULL;

-- Customer messages, business echoes and imported history, deduplicated by Meta message id.
CREATE TABLE public.whatsapp_messages (
  id text PRIMARY KEY,
  direction text NOT NULL DEFAULT 'inbound',
  from_number text,
  to_number text,
  message_type text,
  text_body text,
  media_id text,
  media_mime text,
  media_filename text,
  caption text,
  raw jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  reply_status text NOT NULL DEFAULT 'none',
  reply_error text,
  reply_message_id text,
  reply_attempts integer NOT NULL DEFAULT 0,
  reply_attempted_at timestamptz,
  replied_at timestamptz
);

GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX whatsapp_messages_reply_idx
  ON public.whatsapp_messages (received_at)
  WHERE reply_status IN ('pending', 'failed');

-- Messages the app sent, with delivery state and per-state provider timestamps.
CREATE TABLE public.whatsapp_outbound_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider_message_id text UNIQUE,
  to_number text NOT NULL,
  text_body text,
  template_name text,
  status text NOT NULL DEFAULT 'pending',
  status_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_outbound_messages TO service_role;
ALTER TABLE public.whatsapp_outbound_messages ENABLE ROW LEVEL SECURITY;

-- Delivery callbacks that arrive before their outbound row has been saved.
CREATE TABLE public.whatsapp_pending_statuses (
  message_id text NOT NULL,
  status text NOT NULL,
  recipient_id text,
  provider_timestamp timestamptz,
  errors jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz,
  PRIMARY KEY (message_id, status)
);

GRANT ALL ON public.whatsapp_pending_statuses TO service_role;
ALTER TABLE public.whatsapp_pending_statuses ENABLE ROW LEVEL SECURITY;
CREATE INDEX whatsapp_pending_statuses_due_idx
  ON public.whatsapp_pending_statuses (next_retry_at)
  WHERE applied_at IS NULL;

-- Account-level notices: Meta errors, account state changes and template review results.
CREATE TABLE public.whatsapp_account_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event text NOT NULL,
  detail jsonb,
  received_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_account_events TO service_role;
ALTER TABLE public.whatsapp_account_events ENABLE ROW LEVEL SECURITY;

-- Contacts synced from the WhatsApp Business app.
CREATE TABLE public.whatsapp_contacts (
  phone_number text PRIMARY KEY,
  full_name text,
  action text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_contacts TO service_role;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.access_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  note TEXT,
  consumed_at TIMESTAMPTZ,
  device_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_keys_device_token ON public.access_keys(device_token) WHERE device_token IS NOT NULL;

ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

-- No policies = deny all to anon/authenticated. Service role bypasses RLS.

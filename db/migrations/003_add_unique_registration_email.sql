-- Ensure registration token upserts work by enforcing uniqueness on email
CREATE UNIQUE INDEX IF NOT EXISTS uq_registration_tokens_email ON registration_tokens(email);

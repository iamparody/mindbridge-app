-- Migration 007: Add peer_request_id FK to sessions (resolves circular dependency)
-- Sessions created before PeerRequests existed; now PeerRequests table exists

ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_peer_request
  FOREIGN KEY (peer_request_id)
  REFERENCES peer_requests (id)
  ON DELETE SET NULL;

CREATE INDEX idx_sessions_peer_request ON sessions (peer_request_id);

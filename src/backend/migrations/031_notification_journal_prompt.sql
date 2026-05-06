-- Migration 031: Add journal_prompt notification type
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'journal_prompt';

-- ============================================================================
-- Support Ticket Manager Seed Data
-- Target DBMS: Microsoft SQL Server (T-SQL)
-- ============================================================================

-- Ensure we insert seed data within a transaction for safety
BEGIN TRANSACTION;

-- 1. Seed Users
INSERT INTO dbo.Users (Username, FullName, Email, UserRole)
VALUES 
('alice.support', 'Alice Smith', 'alice.smith@supportmanager.com', 'Support Engineer'),
('bob.dev', 'Bob Johnson', 'bob.johnson@supportmanager.com', 'Software Engineer'),
('charlie.support', 'Charlie Brown', 'charlie.brown@supportmanager.com', 'Support Engineer'),
('david.dev', 'David Davis', 'david.davis@supportmanager.com', 'Software Engineer'),
('system.admin', 'System Administrator', 'admin@supportmanager.com', 'Administrator');

DECLARE @AliceId INT, @BobId INT, @CharlieId INT, @DavidId INT, @AdminId INT;

SELECT @AliceId = UserId FROM dbo.Users WHERE Username = 'alice.support';
SELECT @BobId = UserId FROM dbo.Users WHERE Username = 'bob.dev';
SELECT @CharlieId = UserId FROM dbo.Users WHERE Username = 'charlie.support';
SELECT @DavidId = UserId FROM dbo.Users WHERE Username = 'david.dev';
SELECT @AdminId = UserId FROM dbo.Users WHERE Username = 'system.admin';

-- 2. Seed Tickets
-- Ticket 1
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, CreatedAt, UpdatedAt)
VALUES (
    'Database Connection Timeout', 
    'The production database is returning connection timeouts when fetching report details. Error code: 0x80004005.', 
    'Open', 
    'Critical', 
    @DavidId,
    DATEADD(hour, -24, GETDATE()),
    DATEADD(hour, -24, GETDATE())
);

-- Ticket 2
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, CreatedAt, UpdatedAt)
VALUES (
    'UI Layout Broken on Mobile Viewport', 
    'The ticket list page columns overlap when viewed on screens smaller than 768px. Need responsive design fixes.', 
    'In Progress', 
    'Major', 
    @BobId,
    DATEADD(hour, -20, GETDATE()),
    DATEADD(hour, -18, GETDATE())
);

-- Ticket 3
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, CreatedAt, UpdatedAt)
VALUES (
    'Memory Leak in Background Service', 
    'The Node.js background worker crashes every 4 hours due to Heap Out of Memory. Suspect the stream listener is not being properly detached.', 
    'Open', 
    'Critical', 
    @DavidId,
    DATEADD(hour, -15, GETDATE()),
    DATEADD(hour, -15, GETDATE())
);

-- Ticket 4
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, CreatedAt, UpdatedAt)
VALUES (
    'OAuth2 Authentication Failures', 
    'Users logging in via Google OAuth are receiving intermittent 403 authorization errors. Client ID mismatch suspected.', 
    'In Progress', 
    'Critical', 
    @CharlieId,
    DATEADD(hour, -12, GETDATE()),
    DATEADD(hour, -10, GETDATE())
);

-- Ticket 5
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, ResolutionNotes, CreatedAt, UpdatedAt)
VALUES (
    'Typo in Billing Page Footer', 
    'Footer copyright year says 2024 instead of 2026. Needs a simple copy change.', 
    'Resolved', 
    'Minor', 
    @AliceId,
    'Updated the copyright date in the main footer component config from 2024 to 2026. Re-verified layout renders fine.',
    DATEADD(hour, -8, GETDATE()),
    DATEADD(hour, -7, GETDATE())
);

-- Ticket 6
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, CreatedAt, UpdatedAt)
VALUES (
    'CSV Export Fails on Large Datasets', 
    'When attempting to export more than 50,000 records, the request times out with a 504 Gateway Timeout.', 
    'In Progress', 
    'Major', 
    @DavidId,
    DATEADD(hour, -6, GETDATE()),
    DATEADD(hour, -5, GETDATE())
);

-- Ticket 7
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, ResolutionNotes, CreatedAt, UpdatedAt)
VALUES (
    'Search Index Optimization on AuditLogs', 
    'Slow query performance observed when pulling audit history. Need a non-clustered index on TicketId.', 
    'Resolved', 
    'Major', 
    @BobId,
    'Created a non-clustered index on AuditLog(TicketId) in the staging and production databases. Query speed improved from 1.2s to 12ms.',
    DATEADD(hour, -5, GETDATE()),
    DATEADD(hour, -4, GETDATE())
);

-- Ticket 8
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, CreatedAt, UpdatedAt)
VALUES (
    'Password Reset Email Not Sent', 
    'Intermittent SMTP transmission failures. Logs show connection closed abruptly by peer. Likely rate-limiting from SendGrid.', 
    'Open', 
    'Major', 
    @CharlieId,
    DATEADD(hour, -3, GETDATE()),
    DATEADD(hour, -3, GETDATE())
);

-- Ticket 9
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, ResolutionNotes, CreatedAt, UpdatedAt)
VALUES (
    'CSS badge display misalignment', 
    'StatusBadge has improper padding on standard tables, making the text touch the border.', 
    'Resolved', 
    'Minor', 
    @BobId,
    'Added standard padding rule (px-2.5 py-1) to StatusBadge component CSS and fixed layout.',
    DATEADD(hour, -2, GETDATE()),
    DATEADD(hour, -1, GETDATE())
);

-- Ticket 10
INSERT INTO dbo.Tickets (Title, TicketDescription, TicketStatus, Priority, AssignedUserId, CreatedAt, UpdatedAt)
VALUES (
    'PDF Report Generation Crash', 
    'Puppeteer crashes when generating PDF reports containing high-resolution images. Replaced with raw HTML-to-PDF parser or optimized images.', 
    'Open', 
    'Critical', 
    @DavidId,
    DATEADD(minute, -30, GETDATE()),
    DATEADD(minute, -30, GETDATE())
);

-- 3. Seed Audit Logs for transitions
-- We fetch TicketIds to log their updates
DECLARE @T2_Id INT, @T4_Id INT, @T5_Id INT, @T7_Id INT, @T9_Id INT;

SELECT @T2_Id = TicketId FROM dbo.Tickets WHERE Title = 'UI Layout Broken on Mobile Viewport';
SELECT @T4_Id = TicketId FROM dbo.Tickets WHERE Title = 'OAuth2 Authentication Failures';
SELECT @T5_Id = TicketId FROM dbo.Tickets WHERE Title = 'Typo in Billing Page Footer';
SELECT @T7_Id = TicketId FROM dbo.Tickets WHERE Title = 'Search Index Optimization on AuditLogs';
SELECT @T9_Id = TicketId FROM dbo.Tickets WHERE Title = 'CSS badge display misalignment';

-- Ticket 2 transition (Open -> In Progress)
INSERT INTO dbo.AuditLog (TicketId, ChangedByUserId, FieldName, OldValue, NewValue, ChangedAt)
VALUES (@T2_Id, @BobId, 'TicketStatus', 'Open', 'In Progress', DATEADD(hour, -18, GETDATE()));

-- Ticket 4 transition (Open -> In Progress)
INSERT INTO dbo.AuditLog (TicketId, ChangedByUserId, FieldName, OldValue, NewValue, ChangedAt)
VALUES (@T4_Id, @CharlieId, 'TicketStatus', 'Open', 'In Progress', DATEADD(hour, -10, GETDATE()));

-- Ticket 5 transition (Open -> In Progress -> Resolved)
INSERT INTO dbo.AuditLog (TicketId, ChangedByUserId, FieldName, OldValue, NewValue, ChangedAt)
VALUES 
(@T5_Id, @AliceId, 'TicketStatus', 'Open', 'In Progress', DATEADD(hour, -8, GETDATE())),
(@T5_Id, @AliceId, 'TicketStatus', 'In Progress', 'Resolved', DATEADD(hour, -7, GETDATE())),
(@T5_Id, @AliceId, 'ResolutionNotes', NULL, 'Updated the copyright date in the main footer component config from 2024 to 2026. Re-verified layout renders fine.', DATEADD(hour, -7, GETDATE()));

-- Ticket 7 transition (Open -> In Progress -> Resolved)
INSERT INTO dbo.AuditLog (TicketId, ChangedByUserId, FieldName, OldValue, NewValue, ChangedAt)
VALUES 
(@T7_Id, @BobId, 'TicketStatus', 'Open', 'In Progress', DATEADD(hour, -5, GETDATE())),
(@T7_Id, @BobId, 'TicketStatus', 'In Progress', 'Resolved', DATEADD(hour, -4, GETDATE())),
(@T7_Id, @BobId, 'ResolutionNotes', NULL, 'Created a non-clustered index on AuditLog(TicketId) in the staging and production databases. Query speed improved from 1.2s to 12ms.', DATEADD(hour, -4, GETDATE()));

-- Ticket 9 transition (Open -> Resolved directly)
INSERT INTO dbo.AuditLog (TicketId, ChangedByUserId, FieldName, OldValue, NewValue, ChangedAt)
VALUES 
(@T9_Id, @BobId, 'TicketStatus', 'Open', 'Resolved', DATEADD(hour, -1, GETDATE())),
(@T9_Id, @BobId, 'ResolutionNotes', NULL, 'Added standard padding rule (px-2.5 py-1) to StatusBadge component CSS and fixed layout.', DATEADD(hour, -1, GETDATE()));

COMMIT TRANSACTION;
GO

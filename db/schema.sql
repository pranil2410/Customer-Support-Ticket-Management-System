-- ============================================================================
-- Support Ticket Manager Database Schema
-- Target DBMS: Microsoft SQL Server (T-SQL)
-- ============================================================================

-- Create Users Table
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) NOT NULL,
    Username NVARCHAR(50) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    UserRole NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId ASC),
    CONSTRAINT UQ_Users_Username UNIQUE (Username)
);
GO

-- Create Tickets Table
IF OBJECT_ID('dbo.Tickets', 'U') IS NOT NULL
    DROP TABLE dbo.Tickets;
GO

CREATE TABLE dbo.Tickets (
    TicketId INT IDENTITY(1,1) NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    TicketDescription NVARCHAR(MAX) NOT NULL,
    TicketStatus NVARCHAR(30) NOT NULL,
    Priority NVARCHAR(30) NOT NULL,
    AssignedUserId INT NULL,
    ResolutionNotes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME NOT NULL CONSTRAINT DF_Tickets_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL CONSTRAINT DF_Tickets_UpdatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_Tickets PRIMARY KEY CLUSTERED (TicketId ASC),
    CONSTRAINT FK_Tickets_Users FOREIGN KEY (AssignedUserId) REFERENCES dbo.Users (UserId) ON DELETE SET NULL,
    CONSTRAINT CK_Tickets_Status CHECK (TicketStatus IN ('Open', 'In Progress', 'Resolved')),
    CONSTRAINT CK_Tickets_Priority CHECK (Priority IN ('Critical', 'Major', 'Minor'))
);
GO

-- Create AuditLog Table
IF OBJECT_ID('dbo.AuditLog', 'U') IS NOT NULL
    DROP TABLE dbo.AuditLog;
GO

CREATE TABLE dbo.AuditLog (
    AuditLogId INT IDENTITY(1,1) NOT NULL,
    TicketId INT NOT NULL,
    ChangedByUserId INT NOT NULL,
    FieldName NVARCHAR(50) NOT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    ChangedAt DATETIME NOT NULL CONSTRAINT DF_AuditLog_ChangedAt DEFAULT GETDATE(),
    CONSTRAINT PK_AuditLog PRIMARY KEY CLUSTERED (AuditLogId ASC),
    CONSTRAINT FK_AuditLog_Tickets FOREIGN KEY (TicketId) REFERENCES dbo.Tickets (TicketId) ON DELETE CASCADE,
    CONSTRAINT FK_AuditLog_Users FOREIGN KEY (ChangedByUserId) REFERENCES dbo.Users (UserId)
);
GO

-- ============================================================================
-- Indexes for Performance Tuning
-- ============================================================================

-- Index on Users table to speed up lookups by Username
CREATE UNIQUE NONCLUSTERED INDEX IX_Users_Username 
ON dbo.Users (Username ASC);
GO

-- Indexes on Tickets table to optimize filtering and joins
CREATE NONCLUSTERED INDEX IX_Tickets_TicketStatus 
ON dbo.Tickets (TicketStatus ASC);
GO

-- Index on Priority
CREATE NONCLUSTERED INDEX IX_Tickets_Priority 
ON dbo.Tickets (Priority ASC);
GO

-- Index on AssignedUserId for join performance
CREATE NONCLUSTERED INDEX IX_Tickets_AssignedUserId 
ON dbo.Tickets (AssignedUserId ASC) 
WHERE AssignedUserId IS NOT NULL;
GO

-- Index on AuditLog to speed up loading history for a ticket
CREATE NONCLUSTERED INDEX IX_AuditLog_TicketId 
ON dbo.AuditLog (TicketId ASC);
GO

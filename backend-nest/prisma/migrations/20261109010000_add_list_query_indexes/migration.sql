CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");
CREATE INDEX "User_role_stateBaseCode_createdAt_idx" ON "User"("role", "stateBaseCode", "createdAt");

CREATE INDEX "SupportTicket_stateBaseCode_createdAt_idx" ON "SupportTicket"("stateBaseCode", "createdAt");
CREATE INDEX "SupportTicket_userId_createdAt_idx" ON "SupportTicket"("userId", "createdAt");
CREATE INDEX "SupportTicketResponse_ticketId_createdAt_idx" ON "SupportTicketResponse"("ticketId", "createdAt");

CREATE INDEX "GalleryImage_stateBaseCode_createdAt_idx" ON "GalleryImage"("stateBaseCode", "createdAt");
CREATE INDEX "ContactMessage_stateBaseCode_createdAt_idx" ON "ContactMessage"("stateBaseCode", "createdAt");

-- Rotação de refresh token com janela de tolerância (correção de race condition
-- em refreshs simultâneos de múltiplas abas/dispositivos)
ALTER TABLE "RefreshToken" ADD COLUMN "replacedByToken" TEXT;
ALTER TABLE "RefreshToken" ADD COLUMN "rotatedAt" TIMESTAMP(3);

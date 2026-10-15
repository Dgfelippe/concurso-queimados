const messageOf = (cause: unknown): string => {
  if (cause instanceof Error) return cause.message;
  if (typeof cause === 'string') return cause;
  try { return JSON.stringify(cause); } catch { return ''; }
};

export function isAiQuotaError(cause: unknown): boolean {
  const message = messageOf(cause).toLowerCase();
  return /\b429\b|quota.?exceeded|resource.?exhausted|quota.?failure|rate.?limit/.test(message);
}

export function getAiRetryDelayMs(cause: unknown): number | null {
  const message = messageOf(cause);
  const seconds = message.match(/retry\s+in\s+(\d+(?:\.\d+)?)\s*s(?:ec(?:onds?)?)?/i)?.[1];
  if (seconds) return Math.ceil(Number(seconds) * 1000);
  const structuredSeconds = message.match(/"retryDelay"\s*:\s*"?(\d+(?:\.\d+)?)s/i)?.[1];
  if (structuredSeconds) return Math.ceil(Number(structuredSeconds) * 1000);
  return null;
}

export function getAiUserMessage(cause: unknown): string {
  if (isAiQuotaError(cause)) {
    const delayMs = getAiRetryDelayMs(cause);
    if (delayMs !== null) {
      const seconds = Math.max(1, Math.ceil(delayMs / 1000));
      return `O serviço de questões atingiu o limite temporário. Tente novamente em ${seconds} segundos; seu simulado ainda não foi iniciado.`;
    }
    return 'O limite gratuito de questões foi atingido por enquanto. Aguarde a renovação da cota e tente novamente; seu simulado ainda não foi iniciado.';
  }
  const message = cause instanceof Error ? cause.message : '';
  if (!message || /https?:\/\/|firebase|googleapis|generatecontent|\bAI:\s*Error|quota|generativelanguage/i.test(message)) {
    return 'Não foi possível gerar as questões agora. Tente novamente em instantes ou inicie uma prova com o banco local.';
  }
  return message;
}

export async function withAiQuotaRetry<T>(request: () => Promise<T>, wait: (milliseconds: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), onWait?: (milliseconds: number) => void): Promise<T> {
  try {
    return await request();
  } catch (cause) {
    const delayMs = getAiRetryDelayMs(cause);
    if (!isAiQuotaError(cause) || delayMs === null || delayMs > 30_000) {
      throw new Error(getAiUserMessage(cause), { cause });
    }
    onWait?.(delayMs);
    await wait(delayMs + 500);
    try {
      return await request();
    } catch (retryCause) {
      throw new Error(getAiUserMessage(retryCause), { cause: retryCause });
    }
  }
}

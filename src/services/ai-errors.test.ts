import { describe, expect, it, vi } from 'vitest';
import { getAiRetryDelayMs, getAiUserMessage, isAiQuotaError, withAiQuotaRetry } from './ai-errors';

describe('tratamento de limite temporário do serviço de questões', () => {
  const rateLimit = new Error('AI: Error fetching from generateContent: [429] Quota exceeded. Please retry in 27.449327515s.');

  it('identifica a cota e calcula a espera indicada pelo serviço', () => {
    expect(isAiQuotaError(rateLimit)).toBe(true);
    expect(getAiRetryDelayMs(rateLimit)).toBe(27450);
    expect(getAiUserMessage(rateLimit)).toContain('limite temporário');
  });

  it('espera o intervalo recomendado e tenta uma vez novamente', async () => {
    const request = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(rateLimit)
      .mockResolvedValueOnce('ok');
    const wait = vi.fn<(_: number) => Promise<void>>().mockResolvedValue(undefined);

    await expect(withAiQuotaRetry(request, wait)).resolves.toBe('ok');
    expect(wait).toHaveBeenCalledWith(27950);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('converte erros de cota sem prazo em orientação clara, sem detalhes técnicos', async () => {
    const request = vi.fn<() => Promise<string>>()
      .mockRejectedValue(new Error('429 Quota exceeded for daily request limit'));
    await expect(withAiQuotaRetry(request, vi.fn())).rejects.toThrow(/limite gratuito.*atingido/i);
    expect(getAiUserMessage(rateLimit)).not.toContain('generateContent');
  });
});

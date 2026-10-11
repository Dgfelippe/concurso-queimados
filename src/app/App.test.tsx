import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('navegação principal', () => {
  it('renders_navigation_destinations', () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    const sidebar = within(screen.getByRole('complementary', { name: 'Navegação principal' }));
    expect(sidebar.getByRole('link', { name: 'Painel' })).toBeInTheDocument();
    expect(sidebar.getByRole('link', { name: 'Simulados' })).toBeInTheDocument();
    expect(sidebar.getByRole('link', { name: 'Caderno de erros' })).toBeInTheDocument();
  });
});

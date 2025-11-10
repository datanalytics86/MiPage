import { render, screen } from '@testing-library/react';
import ButtonLink from '../ButtonLink';

describe('ButtonLink', () => {
  it('renders an accessible link with the provided label', () => {
    render(
      <ButtonLink href="/auth/register" variant="fire">
        Únete ahora
      </ButtonLink>
    );

    const link = screen.getByRole('link', { name: 'Únete ahora' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/auth/register');
  });

  it('supports custom classes and full width layout', () => {
    render(
      <ButtonLink href="/services" fullWidth className="test-class">
        Explorar
      </ButtonLink>
    );

    const link = screen.getByRole('link', { name: 'Explorar' });
    expect(link).toHaveClass('w-full');
    expect(link).toHaveClass('test-class');
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('next-auth/react', () => {
  return {
    useSession: jest.fn(),
    signOut: jest.fn(),
  };
});

jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('@mui/material/useMediaQuery', () => jest.fn());

import { useSession, signOut } from 'next-auth/react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { USER_ROLES } from 'lib/auth/roles';

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders desktop sidebar with standard links', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'User', role: USER_ROLES.USER } },
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Environments')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('renders admin link for ADMIN role', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Admin', role: USER_ROLES.ADMIN } },
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<Sidebar />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('calls signOut on logout click', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'User', role: USER_ROLES.USER } },
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<Sidebar />);
    const logoutLink = screen.getByRole('link', { name: /logout/i });
    fireEvent.click(logoutLink);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('renders mobile drawer toggle', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'User', role: USER_ROLES.USER } },
    });
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<Sidebar />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

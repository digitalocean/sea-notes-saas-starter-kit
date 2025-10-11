import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavBar from './NavBar';
import { useSession, signOut } from 'next-auth/react';
import React from 'react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(),
}));

let mockPathName = '/';
const mockUsePathName = jest.fn().mockImplementation(() => ({
  get pathName() {
    return mockPathName;
  },
}));
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathName(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('../../Common/ServiceWarningIndicator/ServiceWarningIndicator', () => ({
  __esModule: true,
  default: () => <div data-testid="ServiceWarningIndicator">ServiceWarningIndicator</div>,
}));

import useMediaQuery from '@mui/material/useMediaQuery';

describe('NavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathName = '/';
  });

  it('renders links for unauthenticated users', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop

    render(<NavBar />);

    const pricingLinks = screen.getAllByText('Pricing');
    expect(pricingLinks.length).toBeGreaterThan(0);
    
    expect(screen.getAllByText('Log in').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sign up').length).toBeGreaterThan(0);
  });

  it('renders links for authenticated users', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Jane' } },
      status: 'authenticated',
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop

    render(<NavBar />);
    const signOutButtons = screen.getAllByText('Sign out');
    expect(signOutButtons.length).toBeGreaterThan(0);
  });

  it('calls signOut on logout click (desktop)', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Jane' } },
      status: 'authenticated',
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop

    render(<NavBar />);

    const signOutButtons = screen.getAllByText('Sign out');
    const appBarButton = signOutButtons.find((el) => el.closest('a')?.getAttribute('href') === '#');

    expect(appBarButton).toBeDefined();
    await userEvent.click(appBarButton!);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('renders drawer toggle on mobile', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Mobile

    render(<NavBar />);
    expect(screen.getByRole('button')).toBeInTheDocument(); // menu icon
  });

  it('renders ServiceWarningIndicator when in landing page', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop
    mockPathName = '/';

    render(<NavBar />);
    expect(screen.getAllByText('ServiceWarningIndicator').length).toBeGreaterThan(0);
  });
});

/**
 * React Testing Library — 25 Component Tests
 * Covers: Badge (5), Button (4), Input (2), Card (2), StatCard (2),
 *         RecentBookings (5), Footer (5)
 *
 * Run:  npm test  (inside fixhub-nepal-frontend/)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Component imports ─────────────────────────────────────────────────────────
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import StatCard from '@/components/Dashboard/StatCard';
import RecentBookings from '@/components/Dashboard/RecentBookings';

// Footer uses next/link — jest config auto-mocks it via next/jest
import Footer from '@/components/layout/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────
const mockIcon = <span data-testid="icon">⚙</span>;

const sampleBookings = [
  {
    id: 'b1',
    user: { name: 'Ram Bahadur', email: 'ram@example.com' },
    service: { name: 'Oil Change' },
    status: 'completed',
    totalPrice: 1200,
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'b2',
    user: { name: 'Sita Karki', email: 'sita@example.com' },
    service: { name: 'Brake Service' },
    status: 'pending',
    totalPrice: 2500,
    createdAt: '2026-02-15T00:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests 1–5 — Badge
// ─────────────────────────────────────────────────────────────────────────────
describe('Badge', () => {
  test('Test 1 — renders children text', () => {
    render(<Badge>Completed</Badge>);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('Test 2 — applies success variant classes', () => {
    const { container } = render(<Badge variant="success">Paid</Badge>);
    expect(container.firstChild).toHaveClass('bg-green-100', 'text-green-700');
  });

  test('Test 3 — applies danger variant classes', () => {
    const { container } = render(<Badge variant="danger">Cancelled</Badge>);
    expect(container.firstChild).toHaveClass('bg-red-100', 'text-red-700');
  });

  test('Test 4 — applies warning variant classes', () => {
    const { container } = render(<Badge variant="warning">Pending</Badge>);
    expect(container.firstChild).toHaveClass('bg-yellow-100', 'text-yellow-700');
  });

  test('Test 5 — applies info variant classes', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    expect(container.firstChild).toHaveClass('bg-blue-100', 'text-blue-700');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests 6–9 — Button
// ─────────────────────────────────────────────────────────────────────────────
describe('Button', () => {
  test('Test 6 — calls onClick once when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('Test 7 — is disabled and shows spinner when loading', () => {
    const { container } = render(<Button loading>Loading…</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('Test 8 — does not fire onClick when button is disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('Test 9 — renders provided children text', () => {
    render(<Button>Book Now</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Book Now');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests 10–11 — Input
// ─────────────────────────────────────────────────────────────────────────────
describe('Input', () => {
  test('Test 10 — renders label and displays error message + error border', () => {
    render(<Input label="Email" error="Email is required" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-danger');
  });

  test('Test 11 — fires onChange with the typed value', () => {
    const handleChange = jest.fn();
    render(<Input label="Name" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Sita' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests 12–13 — Card
// ─────────────────────────────────────────────────────────────────────────────
describe('Card', () => {
  test('Test 12 — renders children and applies hover transition class', () => {
    const { container } = render(
      <Card hover>
        <p>Booking summary</p>
      </Card>
    );

    expect(screen.getByText('Booking summary')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('hover:shadow-xl');
  });

  test('Test 13 — does not apply hover class when hover prop is omitted', () => {
    const { container } = render(
      <Card>
        <p>No hover</p>
      </Card>
    );
    expect(container.firstChild).not.toHaveClass('hover:shadow-xl');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests 14–15 — StatCard
// ─────────────────────────────────────────────────────────────────────────────
describe('StatCard', () => {
  test('Test 14 — renders title, numeric value and subtitle', () => {
    render(
      <StatCard
        title="Total Bookings"
        value={128}
        icon={mockIcon}
        color="#6366f1"
        subtitle="This month"
      />
    );

    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  test('Test 15 — renders without subtitle when subtitle prop is omitted', () => {
    render(
      <StatCard title="Active Users" value={42} icon={mockIcon} color="#10b981" />
    );
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests 16–20 — RecentBookings
// ─────────────────────────────────────────────────────────────────────────────
describe('RecentBookings', () => {
  test('Test 16 — renders customer names and service names for all bookings', () => {
    render(<RecentBookings bookings={sampleBookings} />);

    expect(screen.getByText('Ram Bahadur')).toBeInTheDocument();
    expect(screen.getByText('ram@example.com')).toBeInTheDocument();
    expect(screen.getByText('Oil Change')).toBeInTheDocument();

    expect(screen.getByText('Sita Karki')).toBeInTheDocument();
    expect(screen.getByText('sita@example.com')).toBeInTheDocument();
    expect(screen.getByText('Brake Service')).toBeInTheDocument();
  });

  test('Test 17 — renders status badge text for each booking row', () => {
    render(<RecentBookings bookings={sampleBookings} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  test('Test 18 — renders a "Recent Bookings" heading', () => {
    render(<RecentBookings bookings={sampleBookings} />);
    expect(screen.getByText(/Recent Bookings/i)).toBeInTheDocument();
  });

  test('Test 19 — renders formatted NPR price for each booking', () => {
    render(<RecentBookings bookings={sampleBookings} />);
    expect(screen.getByText(/1,200|1200/)).toBeInTheDocument();
    expect(screen.getByText(/2,500|2500/)).toBeInTheDocument();
  });

  test('Test 20 — renders one row per booking provided', () => {
    render(<RecentBookings bookings={sampleBookings} />);
    // Each booking row has a unique customer email; verify both are present
    const rows = screen.getAllByText(/@example\.com/i);
    expect(rows).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests 21–25 — Footer
// ─────────────────────────────────────────────────────────────────────────────
describe('Footer', () => {
  test('Test 21 — renders brand name and quick-link anchors', () => {
    render(<Footer />);

    // Brand text (multiple elements contain "Fixhub" — copyright, email, span)
    expect(screen.getAllByText(/Fixhub/i).length).toBeGreaterThan(0);

    // Quick Links section heading
    expect(screen.getByText('Quick Links')).toBeInTheDocument();

    // Navigation links are present
    expect(screen.getByRole('link', { name: /Services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About Us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contact/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();
  });

  test('Test 22 — renders "Our Services" section heading', () => {
    render(<Footer />);
    expect(screen.getByText('Our Services')).toBeInTheDocument();
  });

  test('Test 23 — renders the contact section heading', () => {
    render(<Footer />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  test('Test 24 — renders social media or contact links', () => {
    render(<Footer />);
    // Footer should contain at least one anchor element
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  test('Test 25 — renders copyright notice with current or nearby year', () => {
    render(<Footer />);
    expect(screen.getByText(/202[0-9]/)).toBeInTheDocument();
  });
});

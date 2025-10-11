import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserTable from './UserTable';
import { USER_ROLES } from '../../../lib/auth/roles';
import {
  SubscriptionPlanEnum,
  SubscriptionStatusEnum,
  UserWithSubscriptions,
} from '../../../types';

describe('<UserTable />', () => {
  const users: UserWithSubscriptions[] = [
    {
      id: '1',
      name: 'Alice',
      email: 'alice@example.com',
      role: USER_ROLES.USER,
      createdAt: new Date('2023-01-01'),
      subscription: {
        plan: SubscriptionPlanEnum.FREE,
        status: SubscriptionStatusEnum.ACTIVE,
        id: 'sub1',
        userId: '1',
        customerId: null,
        createdAt: new Date('2023-01-01'),
      },
    },
    {
      id: '2',
      name: 'Bob',
      email: 'bob@example.com',
      role: USER_ROLES.ADMIN,
      createdAt: new Date('2023-01-02'),
      subscription: {
        plan: SubscriptionPlanEnum.PRO,
        status: SubscriptionStatusEnum.CANCELED,
        id: 'sub2',
        userId: '2',
        customerId: null,
        createdAt: new Date('2023-01-02'),
      },
    },
  ];
  const handleAdminSwitchChange = jest.fn();
  const handleEditClick = jest.fn();

  it('renders user rows', () => {
    render(
      <UserTable
        users={users}
        selectedUser={null}
        isLoadingEdit={false}
        handleAdminSwitchChange={handleAdminSwitchChange}
        handleEditClick={handleEditClick}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(users.length + 1); // +1 for header
  });

  it('calls handleEditClick when edit button is clicked', () => {
    render(
      <UserTable
        users={users}
        selectedUser={null}
        isLoadingEdit={false}
        handleAdminSwitchChange={handleAdminSwitchChange}
        handleEditClick={handleEditClick}
      />
    );
    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);
    expect(handleEditClick).toHaveBeenCalledWith(users[0]);
  });

  it('calls handleAdminSwitchChange when admin switch is toggled', () => {
    render(
      <UserTable
        users={users}
        selectedUser={null}
        isLoadingEdit={false}
        handleAdminSwitchChange={handleAdminSwitchChange}
        handleEditClick={handleEditClick}
      />
    );
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(handleAdminSwitchChange).toHaveBeenCalled();
  });

  it('shows loading spinner for selected user', () => {
    render(
      <UserTable
        users={users}
        selectedUser={users[0]}
        isLoadingEdit={true}
        handleAdminSwitchChange={handleAdminSwitchChange}
        handleEditClick={handleEditClick}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

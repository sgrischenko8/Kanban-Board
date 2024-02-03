import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Form } from './components/Form/Form';
import { Breadcrumbs } from './components/BreadCrumb/BreadCrumb';
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';

const renderWithProvider = (component) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

const repo = {
  owner: 'facebook',
  repo: 'react-native',
  stars: 24200,
  issues: [
    { id: 1, title: 'first issue' },
    { id: 2, title: 'second issue' },
  ],
};

test('User should enter repo URL in the input on top of the page and press "Load"', () => {
  const submitFormHandler = jest.fn();
  renderWithProvider(<Form repo={repo} onSubmit={submitFormHandler} />);

  const input = screen.getByRole('textbox');
  expect(screen.getByPlaceholderText('Enter repo URL')).toBeInTheDocument();
  expect(input).toBeRequired();
  const rect = input.getBoundingClientRect();
  expect(rect.top).toBeLessThan(40);

  const ButtonElement = screen.getByText(/Load issues/i);
  expect(ButtonElement).toBeInTheDocument();

  userEvent.type(input, 'https://github.com/facebook/react');

  const form = screen.getByTestId('form');
  // for escape undefined input error
  fireEvent.change(form, {
    target: {
      repoUrl: { value: 'https://github.com/facebook/react' },
    },
  });

  userEvent.click(ButtonElement);
  expect(submitFormHandler).toHaveBeenCalled();
});

test('submit function not to be called when repo is allready in the state', () => {
  const submitFormHandler = jest.fn();
  renderWithProvider(<Form repo={repo} onSubmit={submitFormHandler} />);

  const ButtonElement = screen.getByText(/Load issues/i);

  const form = screen.getByTestId('form');

  fireEvent.change(form, {
    target: {
      repoUrl: { value: 'https://github.com/facebook/react-native' },
    },
  });

  userEvent.click(ButtonElement);

  expect(submitFormHandler).not.toHaveBeenCalled();
});

test('submit function not to be called when Url is invalid', () => {
  const submitFormHandler = jest.fn();
  renderWithProvider(<Form repo={repo} onSubmit={submitFormHandler} />);

  const ButtonElement = screen.getByText(/Load issues/i);

  const form = screen.getByTestId('form');

  fireEvent.change(form, {
    target: {
      repoUrl: { value: 'https://github.com/facebook' },
    },
  });

  userEvent.click(ButtonElement);

  expect(submitFormHandler).not.toHaveBeenCalled();
});

test('BreadCrumb and KanbanBoard should be hidden when page have been loaded', () => {
  renderWithProvider(<App />);

  expect(screen.queryByTestId('breadcrumb')).toBeNull();
  expect(screen.queryByTestId('list')).toBeNull();
});

describe('BreadCrumb component', () => {
  it('BreadCrumb contains valid link to GitHub page of the owner of the repo', () => {
    renderWithProvider(<Breadcrumbs repo={repo} />);

    expect(screen.queryByTestId('breadcrumb')).toBeInTheDocument();
    const ownerLinkElement = screen.getByText('facebook');

    expect(ownerLinkElement).toHaveAttribute(
      'href',
      'https://github.com/facebook',
    );
  });

  it('BreadCrumb contains valid link to repo GitHub page', () => {
    renderWithProvider(<Breadcrumbs repo={repo} />);

    const repoLinkElement = screen.getByText('react-native');

    expect(repoLinkElement).toHaveAttribute(
      'href',
      'https://github.com/facebook/react-native',
    );
  });

  it('BreadCrumb contains repo stars amount display', () => {
    renderWithProvider(<Breadcrumbs repo={repo} />);

    const starsPElement = screen.getByText('24 K stars');

    expect(starsPElement).toBeInTheDocument();
  });

  it('repo stars amount less than 1000 displays correctly', () => {
    const repoWith444Stars = {
      owner: 'facebook',
      repo: 'react-native',
      stars: 444,
      issues: [],
    };
    renderWithProvider(<Breadcrumbs repo={repoWith444Stars} />);

    const starsPElement = screen.getByText('0.444 K stars');

    expect(starsPElement).toBeInTheDocument();
  });

  it('repo with no stars displays correctly', () => {
    const repoWithNoStars = {
      owner: 'noname',
      repo: 'test',
      stars: 0,
      issues: [],
    };
    renderWithProvider(<Breadcrumbs repo={repoWithNoStars} />);

    const starsPElement = screen.getByText('0 stars');

    expect(starsPElement).toBeInTheDocument();
  });
});

describe('KanbanBoard component', () => {
  it('KanbanBoard contains 3 columns', () => {
    renderWithProvider(<KanbanBoard repo={repo} />);

    const board = screen.queryByTestId('list');
    expect(board).toBeInTheDocument();

    const columns = board.querySelectorAll('li');

    expect(columns).toHaveLength(3);

    // check that board have correct column subtitle
    const firstColumn = board.querySelectorAll('li')[0];
    const firstSubtitle = firstColumn.querySelector('h2');
    expect(firstSubtitle.textContent).toBe('ToDo');

    const secondColumn = board.querySelectorAll('li')[1];
    const secondSubtitle = secondColumn.querySelector('h2');
    expect(secondSubtitle.textContent).toBe('In Progress');

    const thirdColumn = board.querySelectorAll('li')[2];
    const thirdSubtitle = thirdColumn.querySelector('h2');
    expect(thirdSubtitle.textContent).toBe('Done');
  });
});

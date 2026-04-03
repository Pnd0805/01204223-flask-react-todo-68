import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'

import TodoList from '../TodoList.jsx'
import TodoItem from '../TodoItem.jsx'
import { useAuth } from '../context/AuthContext'


vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockResponse = (body, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
});

const todoItem1 = { id: 1, title: 'First todo', done: false, comments: [] };
const todoItem2 = { id: 2, title: 'Second todo', done: false, comments: [
  { id: 1, message: 'First comment' },
  { id: 2, message: 'Second comment' },
] };
const originalTodoList = [todoItem1, todoItem2];

const baseTodo = {
  id: 1,
  title: 'Sample Todo',
  done: false,
  comments: [],
};


describe('TodoList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    
    useAuth.mockReturnValue({
      username: 'testuser',
      accessToken: 'fake-token',
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders correctly', async () => {
    global.fetch.mockImplementationOnce(() => mockResponse(originalTodoList));
    render(<TodoList apiUrl="http://mock-api/" />);

    expect(await screen.findByText('First todo')).toBeInTheDocument();
    expect(await screen.findByText('Second todo')).toBeInTheDocument();
    expect(await screen.findByText('First comment')).toBeInTheDocument();
    expect(await screen.findByText('Second comment')).toBeInTheDocument();
  });

  it('toggles done on a todo item', async() => {
    const toggledTodoItem1 = { ...todoItem1, done: true };
    global.fetch
      .mockImplementationOnce(() => mockResponse(originalTodoList))    
      .mockImplementationOnce(() => mockResponse(toggledTodoItem1));

    render(<TodoList apiUrl="http://mock-api/" />);
    
    expect(await screen.findByText('First todo')).not.toHaveClass('done');

    const toggleButtons = await screen.findAllByRole('button', { name: /toggle/i })
    toggleButtons[0].click();

    expect(await screen.findByText('First todo')).toHaveClass('done');
    
    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/1\/toggle/), 
      expect.anything()
    );
  });
});


describe('TodoItem', () => {
  it('renders with no comments correctly', () => {
    render(<TodoItem todo={baseTodo} />);
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText('No comments')).toBeInTheDocument();
  });

  it('renders with comments correctly and shows assertion', () => {
    const todoWithComment = {
      ...baseTodo,
      comments: [
        {id: 1, message: 'First comment'},
        {id: 2, message: 'Another comment'},
      ]
    };
    render(<TodoItem todo={todoWithComment} />);
    
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
    
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Another comment')).toBeInTheDocument();
  });

  it('makes callback to toggleDone when Toggle button is clicked', () => {
    const onToggleDone = vi.fn();
    render(<TodoItem todo={baseTodo} toggleDone={onToggleDone} />);
    
    const button = screen.getByRole('button', { name: /toggle/i });
    button.click();
    expect(onToggleDone).toHaveBeenCalledWith(baseTodo.id);
  });

  it('makes callback to deleteTodo when delete button is clicked', () => {
    const onDeleteTodo = vi.fn();
    render(<TodoItem todo={baseTodo} deleteTodo={onDeleteTodo} />);
    
    const button = screen.getByRole('button', { name: '❌' });
    button.click();
    expect(onDeleteTodo).toHaveBeenCalledWith(baseTodo.id);
  });

  it('makes callback to addNewComment when a new comment is added', async () => {
    const onAddNewComment = vi.fn();
    render(<TodoItem todo={baseTodo} addNewComment={onAddNewComment} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'New comment');

    const button = screen.getByRole('button', { name: /add comment/i });
    fireEvent.click(button);

    expect(onAddNewComment).toHaveBeenCalledWith(baseTodo.id, 'New comment');
  });
});
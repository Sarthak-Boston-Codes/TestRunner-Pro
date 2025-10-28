const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');
require('@testing-library/jest-dom');
const Button = require('../../../src/client/components/Button').default;

describe('Button Component Tests', () => {
  test('should render button with text', () => {
    render(React.createElement(Button, null, 'Click me'));
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('should call onClick handler', () => {
    const handleClick = jest.fn();
    render(React.createElement(Button, { onClick: handleClick }, 'Click me'));
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should render as disabled', () => {
    render(React.createElement(Button, { disabled: true }, 'Disabled'));
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  test('should show loading state', () => {
    render(React.createElement(Button, { loading: true }, 'Loading'));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(React.createElement(Button, { onClick: handleClick, disabled: true }, 'Click'));
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('should not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(React.createElement(Button, { onClick: handleClick, loading: true }, 'Click'));
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('should apply primary variant', () => {
    render(React.createElement(Button, { variant: 'primary' }, 'Primary'));
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600');
  });

  test('should apply secondary variant', () => {
    render(React.createElement(Button, { variant: 'secondary' }, 'Secondary'));
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-200');
  });

  test('should apply danger variant', () => {
    render(React.createElement(Button, { variant: 'danger' }, 'Danger'));
    expect(screen.getByText('Danger')).toHaveClass('bg-red-600');
  });

  test('should handle submit type', () => {
    render(React.createElement(Button, { type: 'submit' }, 'Submit'));
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  test('should handle button type by default', () => {
    render(React.createElement(Button, null, 'Default'));
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('should apply custom className', () => {
    render(React.createElement(Button, { className: 'custom' }, 'Custom'));
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  test('should handle multiple clicks', () => {
    const handleClick = jest.fn();
    render(React.createElement(Button, { onClick: handleClick }, 'Click'));
    const button = screen.getByText('Click');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  test('should be focusable', () => {
    render(React.createElement(Button, null, 'Focus'));
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });

  test('should not be focusable when disabled', () => {
    render(React.createElement(Button, { disabled: true }, 'Disabled'));
    const button = screen.getByRole('button');
    button.focus();
    expect(button).not.toHaveFocus();
  });

  test('should handle empty children', () => {
    render(React.createElement(Button, null));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should handle long text', () => {
    const longText = 'A'.repeat(100);
    render(React.createElement(Button, null, longText));
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  test('should handle special characters', () => {
    render(React.createElement(Button, null, '<>&"\''));
    expect(screen.getByText('<>&"\'')).toBeInTheDocument();
  });

  test('should handle null onClick gracefully', () => {
    render(React.createElement(Button, { onClick: null }, 'Click'));
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  test('should handle undefined onClick gracefully', () => {
    render(React.createElement(Button, null, 'Click'));
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  test('should disable when loading is true', () => {
    render(React.createElement(Button, { loading: true }, 'Loading'));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should show spinner when loading', () => {
    render(React.createElement(Button, { loading: true }, 'Loading'));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('should apply opacity when disabled', () => {
    render(React.createElement(Button, { disabled: true }, 'Disabled'));
    expect(screen.getByText('Disabled')).toHaveClass('opacity-50');
  });

  test('should apply base classes', () => {
    render(React.createElement(Button, null, 'Button'));
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
    expect(button).toHaveClass('rounded-lg');
  });

  test('should render children correctly', () => {
    render(React.createElement(Button, null, 
      React.createElement('span', null, 'Icon'),
      React.createElement('span', null, 'Text')
    ));
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  test('should have button role', () => {
    render(React.createElement(Button, null, 'Button'));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should handle rapid state changes', () => {
    const { rerender } = render(React.createElement(Button, { loading: false }, 'Button'));
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    
    rerender(React.createElement(Button, { loading: true }, 'Button'));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('should handle variant changes', () => {
    const { rerender } = render(React.createElement(Button, { variant: 'primary' }, 'Button'));
    expect(screen.getByText('Button')).toHaveClass('bg-blue-600');
    
    rerender(React.createElement(Button, { variant: 'secondary' }, 'Button'));
    expect(screen.getByText('Button')).toHaveClass('bg-gray-200');
  });

  test('should maintain state through re-renders', () => {
    const { rerender } = render(React.createElement(Button, null, 'Button'));
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    rerender(React.createElement(Button, null, 'Button'));
    expect(button).toBeInTheDocument();
  });
});
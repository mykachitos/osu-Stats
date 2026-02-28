import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
//ЕБАНЫЙ А ЧЕ ОНО НЕ РЕДЕПЛОИТСЯ НУ ЛАН ЩА ЗАЦЕНИМ

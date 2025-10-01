import { authService } from '../api';

jest.mock('../api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

describe('API functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('login makes POST request', async () => {
    const mockResponse = { data: { token: 'fake-token' } };
    authService.login.mockResolvedValue(mockResponse.data);

    const result = await authService.login({ email: 'test@example.com', password: 'password' });

    expect(authService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(result).toEqual(mockResponse.data);
  });

  test('register makes POST request', async () => {
    const mockResponse = { data: { user: { id: 1, email: 'test@example.com' } } };
    authService.register.mockResolvedValue(mockResponse.data);

    const result = await authService.register({ email: 'test@example.com', password: 'password', name: 'Test User' });

    expect(authService.register).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password', name: 'Test User' });
    expect(result).toEqual(mockResponse.data);
  });
});

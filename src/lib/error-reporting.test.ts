import { reportError } from './error-reporting'

describe('reportError', () => {
  it('logs to console.error with structured context', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Test error')

    reportError(error, { boundary: 'root' })

    expect(spy).toHaveBeenCalledWith(
      '[Barazo]',
      'root',
      'Test error',
      expect.objectContaining({ boundary: 'root' })
    )

    spy.mockRestore()
  })

  it('includes additional context in the log', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Admin error')

    reportError(error, { boundary: 'admin', page: '/admin/settings' })

    expect(spy).toHaveBeenCalledWith(
      '[Barazo]',
      'admin',
      'Admin error',
      expect.objectContaining({ boundary: 'admin', page: '/admin/settings' })
    )

    spy.mockRestore()
  })
})

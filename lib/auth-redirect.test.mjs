import assert from 'node:assert/strict'
import test from 'node:test'
import { RENTAL_DEFAULT_PATH, safeRentalNextPath } from './auth-redirect.ts'

test('allows only known Rental protected paths', () => {
  assert.equal(safeRentalNextPath('/account'), '/account')
  assert.equal(safeRentalNextPath('/admin/langganan?period=yearly'), '/admin/langganan?period=yearly')
  assert.equal(safeRentalNextPath('/booking/confirm/ABC123'), '/booking/confirm/ABC123')
  assert.equal(safeRentalNextPath('/driver'), '/driver')
})

test('rejects external, ambiguous, encoded, fragmented, and malformed destinations', () => {
  for (const value of [
    '//evil.example/path',
    '/\\evil.example',
    '/%5cevil.example',
    '/%255cevil.example',
    '/%2f%2fevil.example',
    '/https://evil.example',
    '/account#fragment',
    'https://evil.example/account',
    '/account/%',
    '/search',
  ]) {
    assert.equal(safeRentalNextPath(value), RENTAL_DEFAULT_PATH, value)
  }
})


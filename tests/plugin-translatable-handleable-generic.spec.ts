/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { I18nEngine } from '../src/core/i18n-engine';
import { TranslatableHandleableGenericError } from '../src/errors/translatable-handleable-generic';

describe('TranslatableHandleableGenericError', () => {
  let engine: I18nEngine;

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = new I18nEngine([
      { id: 'en', name: 'English', code: 'en', isDefault: true },
    ]);
    engine.register({
      id: 'test',
      strings: {
        en: {
          error: 'An error occurred',
          errorTemplate: 'Error: {message}',
        },
      },
    });
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  it('should create error with basic properties', () => {
    const error = new TranslatableHandleableGenericError('test', 'error');

    expect(error.message).toBe('An error occurred');
    expect(error.statusCode).toBe(500);
    expect(error.handled).toBe(false);
  });

  it('should create error with custom status code', () => {
    const error = new TranslatableHandleableGenericError(
      'test',
      'error',
      undefined,
      undefined,
      undefined,
      undefined,
      { statusCode: 404 },
    );

    expect(error.statusCode).toBe(404);
  });

  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const error = new TranslatableHandleableGenericError(
      'test',
      'error',
      undefined,
      undefined,
      undefined,
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('should create error with source data', () => {
    const sourceData = { userId: 123 };
    const error = new TranslatableHandleableGenericError(
      'test',
      'error',
      undefined,
      undefined,
      undefined,
      undefined,
      { sourceData },
    );

    expect(error.sourceData).toEqual(sourceData);
  });

  it('should allow setting handled property', () => {
    const error = new TranslatableHandleableGenericError('test', 'error');

    expect(error.handled).toBe(false);
    error.handled = true;
    expect(error.handled).toBe(true);
  });

  it('should translate with variables', () => {
    const error = new TranslatableHandleableGenericError(
      'test',
      'errorTemplate',
      { message: 'test message' },
    );

    expect(error.message).toBe('Error: test message');
  });

  it('should serialize to JSON', () => {
    const cause = new Error('Cause');
    const error = new TranslatableHandleableGenericError(
      'test',
      'error',
      undefined,
      undefined,
      undefined,
      undefined,
      { statusCode: 400, cause, sourceData: { key: 'value' } },
    );

    const json = error.toJSON();

    expect(json.statusCode).toBe(400);
    expect(json.message).toBe('An error occurred');
    expect(json.cause).toBe(cause);
    expect(json.sourceData).toEqual({ key: 'value' });
  });
});

import { createTemplateProcessor } from '../src/template';

enum TestStrings {
  Simple = 'simple',
  UserGreeting = 'userGreeting',
  UserGreetingTemplate = 'userGreetingTemplate',
  AdminWelcomeTemplate = 'adminWelcomeTemplate',
}

enum TestLanguages {
  English = 'English',
  Spanish = 'Spanish',
}

describe('template processing', () => {
  let translateFn: jest.MockedFunction<(key: string, vars?: Record<string, string | number>, language?: TestLanguages) => string>;
  let templateProcessor: any;

  beforeEach(() => {
    translateFn = jest.fn();
    templateProcessor = createTemplateProcessor(
      TestStrings as any,
      translateFn as any,
      'TestStrings'
    );
  });

  describe('createTemplateProcessor', () => {
    it('should create a template processor function', () => {
      expect(typeof templateProcessor).toBe('function');
    });

    it('should process simple strings without enum patterns', () => {
      const result = templateProcessor('Hello World');
      expect(result).toBe('Hello World');
      expect(translateFn).not.toHaveBeenCalled();
    });

    it('should process enum patterns', () => {
      translateFn.mockReturnValue('Hello');
      
      const result = templateProcessor('{{TestStrings.Simple}}');
      
      expect(translateFn).toHaveBeenCalledWith('simple', {}, undefined);
      expect(result).toBe('Hello');
    });

    it('should process enum patterns with language', () => {
      translateFn.mockReturnValue('Hola');
      
      const result = templateProcessor('{{TestStrings.Simple}}', TestLanguages.Spanish);
      
      expect(translateFn).toHaveBeenCalledWith('simple', {}, TestLanguages.Spanish);
      expect(result).toBe('Hola');
    });

    it('should process template enum patterns with variables', () => {
      translateFn.mockReturnValue('Hello, John!');
      
      const result = templateProcessor(
        '{{TestStrings.UserGreetingTemplate}}',
        TestLanguages.English,
        { name: 'John' }
      );
      
      expect(translateFn).toHaveBeenCalledWith('userGreetingTemplate', { name: 'John' }, TestLanguages.English);
      expect(result).toBe('Hello, John!');
    });

    it('should process multiple enum patterns', () => {
      translateFn
        .mockReturnValueOnce('Hello')
        .mockReturnValueOnce('Welcome');
      
      const result = templateProcessor(
        '{{TestStrings.Simple}} and {{TestStrings.UserGreeting}}'
      );
      
      expect(translateFn).toHaveBeenCalledTimes(2);
      expect(translateFn).toHaveBeenNthCalledWith(1, 'simple', {}, undefined);
      expect(translateFn).toHaveBeenNthCalledWith(2, 'userGreeting', {}, undefined);
      expect(result).toBe('Hello and Welcome');
    });

    it('should handle template patterns that need variables', () => {
      translateFn
        .mockReturnValueOnce('Hello, John!')
        .mockReturnValueOnce('Welcome to MyApp, Jane!');
      
      const result = templateProcessor(
        '{{TestStrings.UserGreetingTemplate}} {{TestStrings.AdminWelcomeTemplate}}',
        TestLanguages.English,
        { name: 'John' },
        { name: 'Jane', app: 'MyApp' }
      );
      
      expect(translateFn).toHaveBeenCalledTimes(2);
      expect(translateFn).toHaveBeenNthCalledWith(1, 'userGreetingTemplate', { name: 'John' }, TestLanguages.English);
      expect(translateFn).toHaveBeenNthCalledWith(2, 'adminWelcomeTemplate', { name: 'Jane', app: 'MyApp' }, TestLanguages.English);
      expect(result).toBe('Hello, John! Welcome to MyApp, Jane!');
    });

    it('should handle non-template enum patterns without variables', () => {
      translateFn.mockReturnValue('Hello');
      
      const result = templateProcessor(
        '{{TestStrings.Simple}}',
        TestLanguages.English,
        { name: 'John' }
      );
      
      expect(translateFn).toHaveBeenCalledWith('simple', {}, TestLanguages.English);
      expect(result).toBe('Hello');
    });

    it('should replace remaining variables after enum processing', () => {
      translateFn.mockReturnValue('Hello');
      
      const result = templateProcessor(
        '{{TestStrings.Simple}} {name}!',
        TestLanguages.English,
        { name: 'John' }
      );
      
      expect(result).toBe('Hello John!');
    });

    it('should handle multiple variable objects', () => {
      const result = templateProcessor(
        'Hello {firstName} {lastName}!',
        TestLanguages.English,
        { firstName: 'John' },
        { lastName: 'Doe' }
      );
      
      expect(result).toBe('Hello John Doe!');
    });

    it('should handle overlapping variables from multiple objects', () => {
      const result = templateProcessor(
        'Hello {name}!',
        TestLanguages.English,
        { name: 'John' },
        { name: 'Jane' } // This should override the first
      );
      
      expect(result).toBe('Hello Jane!');
    });

    it('should leave unmatched enum patterns unchanged', () => {
      const result = templateProcessor('{{TestStrings.NonExistent}}');
      
      expect(result).toBe('{{TestStrings.NonExistent}}');
      expect(translateFn).not.toHaveBeenCalled();
    });

    it('should leave unmatched variables unchanged', () => {
      const result = templateProcessor(
        'Hello {unknownVar}!',
        TestLanguages.English,
        { name: 'John' }
      );
      
      expect(result).toBe('Hello {unknownVar}!');
    });

    it('should handle empty variable objects', () => {
      translateFn.mockReturnValue('Hello');
      
      const result = templateProcessor(
        '{{TestStrings.Simple}} {name}!',
        TestLanguages.English,
        {},
        {}
      );
      
      expect(result).toBe('Hello {name}!');
    });

    it('should handle complex mixed patterns', () => {
      translateFn
        .mockReturnValueOnce('Welcome')
        .mockReturnValueOnce('Hello, John!');
      
      const result = templateProcessor(
        '{{TestStrings.UserGreeting}} to {app}! {{TestStrings.UserGreetingTemplate}}',
        TestLanguages.English,
        { app: 'MyApp' },
        { name: 'John' }
      );
      
      expect(translateFn).toHaveBeenCalledTimes(2);
      expect(result).toBe('Welcome to MyApp! Hello, John!');
    });

    it('should handle case-insensitive template detection', () => {
      translateFn.mockReturnValue('Hello, John!');
      
      // Test with uppercase TEMPLATE suffix
      const upperCaseEnum = { UserGreetingTEMPLATE: 'userGreetingTEMPLATE' };
      const upperProcessor = createTemplateProcessor(
        upperCaseEnum as any,
        translateFn as any,
        'TestStrings'
      );
      
      const result = upperProcessor(
        '{{TestStrings.UserGreetingTEMPLATE}}',
        TestLanguages.English,
        { name: 'John' }
      );
      
      expect(translateFn).toHaveBeenCalledWith('userGreetingTEMPLATE', { name: 'John' }, TestLanguages.English);
      expect(result).toBe('Hello, John!');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const result = templateProcessor('');
      expect(result).toBe('');
    });

    it('should handle strings with only variables', () => {
      const result = templateProcessor('{name}', TestLanguages.English, { name: 'John' });
      expect(result).toBe('John');
    });

    it('should handle strings with only enum patterns', () => {
      translateFn.mockReturnValue('Hello');
      const result = templateProcessor('{{TestStrings.Simple}}');
      expect(result).toBe('Hello');
    });

    it('should handle malformed enum patterns', () => {
      const result = templateProcessor('{{TestStrings.}}');
      expect(result).toBe('{{TestStrings.}}');
      expect(translateFn).not.toHaveBeenCalled();
    });

    it('should handle nested braces', () => {
      const result = templateProcessor('{{{name}}}', TestLanguages.English, { name: 'John' });
      expect(result).toBe('{{John}}'); // Only the inner {name} is replaced
    });
  });
});
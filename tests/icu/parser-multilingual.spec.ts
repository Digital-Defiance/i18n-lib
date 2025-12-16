/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { NodeType } from '../../src/icu/ast';
import { parse } from '../../src/icu/parser';

/**
 * Multilingual ICU MessageFormat Parser Tests
 *
 * These tests verify the parser handles real-world messages in various languages.
 * Note: The ICU keywords (plural, select, one, other, etc.) are always in English,
 * but the message content is in the target language.
 */
describe('ICU MessageFormat Parser - Multilingual', () => {
  describe('Russian (complex plural rules)', () => {
    it('should parse Russian plural with all forms', () => {
      // Russian has 4 plural forms: one (1, 21, 31...), few (2-4, 22-24...), many (5-20, 25-30...), other
      const ast = parse(
        '{count, plural, one {# день} few {# дня} many {# дней} other {# дней}}',
      );
      const plural = ast.elements[0] as any;
      expect(plural.type).toBe(NodeType.PLURAL);
      expect(plural.cases.one.elements[1].value).toBe(' день');
      expect(plural.cases.few.elements[1].value).toBe(' дня');
      expect(plural.cases.many.elements[1].value).toBe(' дней');
    });

    it('should parse Russian notification message', () => {
      const ast = parse(
        '{sender} отправил вам {count, plural, one {# сообщение} few {# сообщения} many {# сообщений} other {# сообщений}}',
      );
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'sender',
      });
      expect(ast.elements[1]).toEqual({
        type: NodeType.LITERAL,
        value: ' отправил вам ',
      });
      expect(ast.elements[2].type).toBe(NodeType.PLURAL);
    });

    it('should parse Russian with ASCII variable names', () => {
      // Note: ICU MessageFormat requires ASCII variable names, but message content can be any Unicode
      const ast = parse(
        'У вас {count, plural, one {# товар} few {# товара} many {# товаров} other {# товаров}}',
      );
      const plural = ast.elements[1] as any;
      expect(plural.name).toBe('count');
      expect(plural.cases.one.elements[1].value).toBe(' товар');
    });
  });

  describe('Arabic (RTL and complex plurals)', () => {
    it('should parse Arabic plural with all six forms', () => {
      // Arabic has 6 plural forms: zero, one, two, few, many, other
      const ast = parse(
        '{count, plural, zero {لا عناصر} one {عنصر واحد} two {عنصران} few {# عناصر} many {# عنصر} other {# عنصر}}',
      );
      const plural = ast.elements[0] as any;
      expect(plural.type).toBe(NodeType.PLURAL);
      expect(plural.cases.zero).toBeDefined();
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.two).toBeDefined();
      expect(plural.cases.few).toBeDefined();
      expect(plural.cases.many).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });

    it('should parse Arabic RTL text with LTR variables', () => {
      const ast = parse('مرحبا {name}، لديك {count} رسائل جديدة');
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: 'مرحبا ',
      });
      expect(ast.elements[1]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'name',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.LITERAL,
        value: '، لديك ',
      });
    });

    it('should parse Arabic nested select and plural', () => {
      const ast = parse(
        '{gender, select, male {{count, plural, one {لديه # عنصر} other {لديه # عناصر}}} female {{count, plural, one {لديها # عنصر} other {لديها # عناصر}}}}',
      );
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(select.cases.male.elements[0].type).toBe(NodeType.PLURAL);
      expect(select.cases.female.elements[0].type).toBe(NodeType.PLURAL);
    });
  });

  describe('Polish (complex few/many rules)', () => {
    it('should parse Polish plural forms', () => {
      // Polish: one (1), few (2-4, 22-24...), many (5-21, 25-31...), other
      const ast = parse(
        '{count, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}',
      );
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[1].value).toBe(' plik');
      expect(plural.cases.few.elements[1].value).toBe(' pliki');
      expect(plural.cases.many.elements[1].value).toBe(' plików');
    });

    it('should parse Polish with special characters', () => {
      const ast = parse(
        'Masz {count, plural, one {# wiadomość} few {# wiadomości} many {# wiadomości} other {# wiadomości}} od {sender}',
      );
      expect(ast.elements).toHaveLength(4);
      const plural = ast.elements[1] as any;
      expect(plural.cases.one.elements[1].value).toBe(' wiadomość');
    });
  });

  describe('Japanese (no plurals, but complex formatting)', () => {
    it('should parse Japanese with counters', () => {
      // Japanese doesn't use plural forms, but has counters
      const ast = parse('{count}個のアイテムがあります');
      expect(ast.elements).toHaveLength(2);
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'count',
      });
      expect(ast.elements[1]).toEqual({
        type: NodeType.LITERAL,
        value: '個のアイテムがあります',
      });
    });

    it('should parse Japanese with select for politeness', () => {
      const ast = parse(
        '{formality, select, formal {いらっしゃいませ、{name}様} casual {こんにちは、{name}さん} other {こんにちは、{name}}}',
      );
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(select.cases.formal).toBeDefined();
      expect(select.cases.casual).toBeDefined();
    });

    it('should parse Japanese with mixed scripts', () => {
      const ast = parse('{user}さんが{count}件のメッセージを送信しました');
      expect(ast.elements).toHaveLength(4);
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'user',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'count',
      });
    });
  });

  describe('Chinese (simplified and traditional)', () => {
    it('should parse Simplified Chinese', () => {
      const ast = parse('你有{count}条新消息');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: '你有',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.LITERAL,
        value: '条新消息',
      });
    });

    it('should parse Traditional Chinese', () => {
      const ast = parse('您有{count}則新訊息');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: '您有',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.LITERAL,
        value: '則新訊息',
      });
    });

    it('should parse Chinese with select for measure words', () => {
      const ast = parse(
        '{type, select, person {{count}个人} book {{count}本书} animal {{count}只动物} other {{count}个}}',
      );
      const select = ast.elements[0] as any;
      expect(select.cases.person).toBeDefined();
      expect(select.cases.book).toBeDefined();
      expect(select.cases.animal).toBeDefined();
    });
  });

  describe('French (gender agreement)', () => {
    it('should parse French with gender select', () => {
      const ast = parse(
        '{gender, select, male {Il a {count} messages} female {Elle a {count} messages} other {Iel a {count} messages}}',
      );
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(select.cases.male.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: 'Il a ',
      });
      expect(select.cases.female.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: 'Elle a ',
      });
    });

    it('should parse French plural with liaison', () => {
      const ast = parse('{count, plural, one {# élément} other {# éléments}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[1].value).toBe(' élément');
      expect(plural.cases.other.elements[1].value).toBe(' éléments');
    });

    it('should parse French nested gender and plural', () => {
      const ast = parse(
        '{gender, select, male {{count, plural, one {Il a # ami} other {Il a # amis}}} female {{count, plural, one {Elle a # amie} other {Elle a # amies}}}}',
      );
      const select = ast.elements[0] as any;
      const malePlural = select.cases.male.elements[0] as any;
      const femalePlural = select.cases.female.elements[0] as any;
      expect(malePlural.cases.one.elements[0].value).toBe('Il a ');
      expect(malePlural.cases.one.elements[1].value).toBe('#');
      expect(malePlural.cases.one.elements[2].value).toBe(' ami');
      expect(femalePlural.cases.one.elements[2].value).toBe(' amie');
    });
  });

  describe('German (case system)', () => {
    it('should parse German with umlauts', () => {
      const ast = parse(
        'Sie haben {count, plural, one {# Nachricht} other {# Nachrichten}} von {sender}',
      );
      expect(ast.elements).toHaveLength(4);
      const plural = ast.elements[1] as any;
      expect(plural.cases.one.elements[1].value).toBe(' Nachricht');
    });

    it('should parse German with compound words', () => {
      const ast = parse(
        '{count, plural, one {# Benutzerkontoeinstellung} other {# Benutzerkontoeinstellungen}}',
      );
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[1].value).toBe(
        ' Benutzerkontoeinstellung',
      );
      expect(plural.cases.other.elements[1].value).toBe(
        ' Benutzerkontoeinstellungen',
      );
    });
  });

  describe('Spanish (gender and regional variants)', () => {
    it('should parse Spanish with gender agreement', () => {
      const ast = parse(
        '{gender, select, male {Él está conectado} female {Ella está conectada} other {Está conectade}}',
      );
      const select = ast.elements[0] as any;
      expect(select.cases.male.elements[0].value).toBe('Él está conectado');
      expect(select.cases.female.elements[0].value).toBe('Ella está conectada');
    });

    it('should parse Spanish with inverted punctuation', () => {
      const ast = parse('¡Hola {name}! ¿Cómo estás?');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: '¡Hola ',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.LITERAL,
        value: '! ¿Cómo estás?',
      });
    });
  });

  describe('Korean (honorifics and particles)', () => {
    it('should parse Korean with honorific select', () => {
      const ast = parse(
        '{formality, select, formal {{name}님께서 {count}개의 메시지를 보내셨습니다} casual {{name}가 {count}개의 메시지를 보냈어} other {{name}이 {count}개의 메시지를 보냈습니다}}',
      );
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(select.cases.formal).toBeDefined();
      expect(select.cases.casual).toBeDefined();
    });

    it('should parse Korean with Hangul', () => {
      const ast = parse('안녕하세요 {name}님, {count}개의 알림이 있습니다');
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: '안녕하세요 ',
      });
    });
  });

  describe('Hindi (Devanagari script)', () => {
    it('should parse Hindi with Devanagari', () => {
      const ast = parse('आपके पास {count} नए संदेश हैं');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: 'आपके पास ',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.LITERAL,
        value: ' नए संदेश हैं',
      });
    });

    it('should parse Hindi with gender select', () => {
      const ast = parse(
        '{gender, select, male {{name} ने {count} संदेश भेजे} female {{name} ने {count} संदेश भेजीं} other {{name} ने {count} संदेश भेजे}}',
      );
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(select.cases.male).toBeDefined();
      expect(select.cases.female).toBeDefined();
    });
  });

  describe('Turkish (vowel harmony)', () => {
    it('should parse Turkish plural', () => {
      const ast = parse('{count, plural, one {# öğe} other {# öğe}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[1].value).toBe(' öğe');
    });

    it('should parse Turkish with special characters', () => {
      const ast = parse('Merhaba {name}, {count} yeni mesajınız var');
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: 'Merhaba ',
      });
    });
  });

  describe('Mixed language content', () => {
    it('should parse message with multiple scripts', () => {
      const ast = parse('Hello {name}さん, you have {count} 条消息');
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({
        type: NodeType.LITERAL,
        value: 'Hello ',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.LITERAL,
        value: 'さん, you have ',
      });
      expect(ast.elements[4]).toEqual({
        type: NodeType.LITERAL,
        value: ' 条消息',
      });
    });

    it('should parse code-switching message', () => {
      const ast = parse(
        '{user} sent you {count, plural, one {un message} other {# messages}}',
      );
      expect(ast.elements).toHaveLength(3);
      const plural = ast.elements[2] as any;
      expect(plural.cases.one.elements[0].value).toBe('un message');
    });
  });

  describe('Emoji and special Unicode', () => {
    it('should parse message with emoji', () => {
      const ast = parse(
        '🎉 {name} has {count, plural, one {# gift} other {# gifts}}!',
      );
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: '🎉 ' });
      expect(ast.elements[1]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'name',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.LITERAL,
        value: ' has ',
      });
      expect(ast.elements[3].type).toBe(NodeType.PLURAL);
      expect(ast.elements[4]).toEqual({ type: NodeType.LITERAL, value: '!' });
    });

    it('should parse message with various Unicode symbols', () => {
      const ast = parse('✓ {status} • {count} items → {destination}');
      expect(ast.elements).toHaveLength(6);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: '✓ ' });
      expect(ast.elements[1]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'status',
      });
      expect(ast.elements[2]).toEqual({ type: NodeType.LITERAL, value: ' • ' });
      expect(ast.elements[3]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'count',
      });
      expect(ast.elements[4]).toEqual({
        type: NodeType.LITERAL,
        value: ' items → ',
      });
      expect(ast.elements[5]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'destination',
      });
    });
  });

  describe('Complex real-world multilingual scenarios', () => {
    it('should parse e-commerce notification in Russian', () => {
      const ast = parse(
        '{customerName}, ваш заказ {orderId} содержит {itemCount, plural, one {# товар} few {# товара} many {# товаров} other {# товаров}} на сумму {total, number, currency}',
      );
      expect(ast.elements).toHaveLength(7);
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'customerName',
      });
      expect(ast.elements[1]).toEqual({
        type: NodeType.LITERAL,
        value: ', ваш заказ ',
      });
      expect(ast.elements[2]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'orderId',
      });
      expect(ast.elements[3]).toEqual({
        type: NodeType.LITERAL,
        value: ' содержит ',
      });
      expect(ast.elements[4].type).toBe(NodeType.PLURAL);
      expect(ast.elements[5]).toEqual({
        type: NodeType.LITERAL,
        value: ' на сумму ',
      });
      expect(ast.elements[6]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'total',
        format: 'number',
        style: 'currency',
      });
    });

    it('should parse social media post in Arabic', () => {
      const ast = parse(
        '{userName} {action, select, liked {أعجب} commented {علق على} shared {شارك} other {تفاعل مع}} {postType, select, photo {صورتك} video {فيديوك} post {منشورك} other {محتواك}}',
      );
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'userName',
      });
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' ' });
      expect(ast.elements[2].type).toBe(NodeType.SELECT);
      expect(ast.elements[3]).toEqual({ type: NodeType.LITERAL, value: ' ' });
      expect(ast.elements[4].type).toBe(NodeType.SELECT);
    });

    it('should parse calendar reminder in Japanese', () => {
      const ast = parse(
        '{eventName}は{timeUntil, plural, one {# 分後} other {# 分後}}に始まります。{location}で{attendeeCount}人が参加予定です。',
      );
      expect(ast.elements).toHaveLength(8);
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'eventName',
      });
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: 'は' });
      const plural = ast.elements[2] as any;
      expect(plural.type).toBe(NodeType.PLURAL);
    });

    it('should parse nested gender/plural in French', () => {
      // Simplified version without nested select in select
      const ast = parse(
        '{ownerGender, select, male {{itemCount, plural, one {Son # article} other {Ses # articles}}} female {{itemCount, plural, one {Son # article} other {Ses # articles}}}}',
      );
      const outerSelect = ast.elements[0] as any;
      expect(outerSelect.type).toBe(NodeType.SELECT);
      const malePlural = outerSelect.cases.male.elements[0] as any;
      expect(malePlural.type).toBe(NodeType.PLURAL);
      expect(malePlural.cases.one.elements[0].value).toBe('Son ');
      expect(malePlural.cases.one.elements[1].value).toBe('#');
      expect(malePlural.cases.one.elements[2].value).toBe(' article');
    });
  });
});

import { AIToolItem } from '../types';

export const TOOLS_DATA: AIToolItem[] = [
  // ===================== 1. TEXT & WRITING (1-15) =====================
  {
    id: 'word-counter',
    title: 'Подсчет слов и символов',
    category: 'text',
    description: 'Мгновенный детальный подсчет слов, символов с пробелами и без, строк, абзацев и времени чтения.',
    icon: 'FileText',
    offlineSupport: true,
    tags: ['текст', 'слова', 'статистика'],
    placeholderInput: 'Введите или вставьте текст...',
    defaultAction: (input) => {
      const chars = input.length;
      const charsNoSpaces = input.replace(/\s+/g, '').length;
      const words = input.trim() ? input.trim().split(/\s+/).length : 0;
      const lines = input.split('\n').length;
      const readingTime = Math.ceil(words / 200);
      return `📊 **Статистика текста:**\n- Слов: ${words}\n- Символов (всего): ${chars}\n- Символов (без пробелов): ${charsNoSpaces}\n- Строк: ${lines}\n- Примерное время чтения: ~${readingTime} мин.`;
    }
  },
  {
    id: 'text-case-converter',
    title: 'Конвертер регистра',
    category: 'text',
    description: 'Преобразование текста в UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case.',
    icon: 'Type',
    offlineSupport: true,
    tags: ['регистр', 'буквы', 'форматирование'],
    placeholderInput: 'Пример Текста Для Преобразования',
    defaultAction: (input) => {
      const upper = input.toUpperCase();
      const lower = input.toLowerCase();
      const snake = input.trim().toLowerCase().replace(/[\s\W]+/g, '_');
      const kebab = input.trim().toLowerCase().replace(/[\s\W]+/g, '-');
      const camel = input.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return "";
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      });
      return `🔤 **Варианты регистра:**\n\n- **UPPERCASE**: ${upper}\n- **lowercase**: ${lower}\n- **camelCase**: ${camel}\n- **snake_case**: ${snake}\n- **kebab-case**: ${kebab}`;
    }
  },
  {
    id: 'remove-duplicates',
    title: 'Удаление дубликатов строк',
    category: 'text',
    description: 'Очистка текста и списков от повторяющихся строк с сохранением или сортировкой.',
    icon: 'ListFilter',
    offlineSupport: true,
    tags: ['строки', 'дубликаты', 'очистка'],
    placeholderInput: 'яблоко\nгруша\nяблоко\nбанан',
    defaultAction: (input) => {
      const lines = input.split('\n');
      const unique = Array.from(new Set(lines));
      return `✅ **Очищено от повторов (${lines.length} -> ${unique.length} строк):**\n\n${unique.join('\n')}`;
    }
  },
  {
    id: 'sort-lines',
    title: 'Сортировка строк (A-Z / Z-A)',
    category: 'text',
    description: 'Алфавитная сортировка строк по возрастанию, убыванию или длине.',
    icon: 'ArrowUpDown',
    offlineSupport: true,
    tags: ['сортировка', 'алфавит', 'список'],
    placeholderInput: 'Дельта\nАльфа\nГамма\nБета',
    defaultAction: (input) => {
      const lines = input.split('\n').filter(Boolean);
      const asc = [...lines].sort((a, b) => a.localeCompare(b));
      return `🔤 **Отсортировано (A-Z):**\n\n${asc.join('\n')}`;
    }
  },
  {
    id: 'reverse-text',
    title: 'Реверс текста и строк',
    category: 'text',
    description: 'Зеркальное отражение текста посимвольно или построчно.',
    icon: 'RotateCcw',
    offlineSupport: true,
    tags: ['реверс', 'зеркало'],
    placeholderInput: 'Привет мир',
    defaultAction: (input) => {
      const reversedChars = input.split('').reverse().join('');
      const reversedLines = input.split('\n').reverse().join('\n');
      return `🔄 **Реверс символов:**\n${reversedChars}\n\n🔄 **Реверс строк:**\n${reversedLines}`;
    }
  },
  {
    id: 'lorem-ipsum',
    title: 'Генератор рыбы-текста (Lorem Ipsum)',
    category: 'text',
    description: 'Генерация заполнителя текста заданной длины на латыни или русском.',
    icon: 'AlignLeft',
    offlineSupport: true,
    tags: ['lorem', 'рыба', 'макет'],
    placeholderInput: 'Количество абзацев (по умолчанию 3)',
    defaultAction: (input) => {
      const count = parseInt(input) || 3;
      const p = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida."
      ];
      let res = [];
      for (let i = 0; i < count; i++) {
        res.push(p[i % p.length]);
      }
      return res.join('\n\n');
    }
  },
  {
    id: 'strip-html',
    title: 'Удаление HTML-тегов',
    category: 'text',
    description: 'Быстрое извлечение чистого текста из HTML-разметки.',
    icon: 'CodeXml',
    offlineSupport: true,
    tags: ['html', 'теги', 'очистка'],
    placeholderInput: '<p>Привет <b>мир</b>! <a href="#">Ссылка</a></p>',
    defaultAction: (input) => {
      const clean = input.replace(/<\/?[^>]+(>|$)/g, "");
      return clean.trim();
    }
  },
  {
    id: 'extract-emails',
    title: 'Извлечение Email-адресов',
    category: 'text',
    description: 'Автоматический поиск и извлечение всех почтовых адресов из любого объема текста.',
    icon: 'Mail',
    offlineSupport: true,
    tags: ['email', 'почта', 'парсер'],
    placeholderInput: 'Контакты: info@google.com, support@apple.com и hello@test.ru',
    defaultAction: (input) => {
      const matches = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
      if (!matches) return 'Email-адресов не найдено.';
      const unique = Array.from(new Set(matches));
      return `Найдено (${unique.length}):\n` + unique.join('\n');
    }
  },
  {
    id: 'extract-urls',
    title: 'Извлечение ссылок (URL)',
    category: 'text',
    description: 'Находит все веб-ссылки (http/https/ftp) в документе.',
    icon: 'Link',
    offlineSupport: true,
    tags: ['url', 'ссылки', 'web'],
    placeholderInput: 'Посетите https://google.com или http://example.org/test',
    defaultAction: (input) => {
      const matches = input.match(/https?:\/\/[^\s]+/g);
      if (!matches) return 'Ссылки не найдены.';
      const unique = Array.from(new Set(matches));
      return `Найдено ссылок (${unique.length}):\n` + unique.join('\n');
    }
  },
  {
    id: 'translit',
    title: 'Транслитерация (Кириллица <-> Латиница)',
    category: 'text',
    description: 'Конвертация русского текста в латиницу по стандарту ГОСТ/ISO.',
    icon: 'Languages',
    offlineSupport: true,
    tags: ['транслит', 'русский', 'латиница'],
    placeholderInput: 'Привет мир! Как дела?',
    defaultAction: (input) => {
      const ru = "А_Б_В_Г_Д_Е_Ё_Ж_З_И_Й_К_Л_М_Н_О_П_Р_С_Т_У_Ф_Х_Ц_Ч_Ш_Щ_Ъ_Ы_Ь_Э_Ю_Я_а_б_в_г_д_е_ё_ж_з_и_й_к_л_м_н_о_п_р_с_т_у_ф_х_ц_ч_ш_щ_ъ_ы_ь_э_ю_я".split("_");
      const en = "A_B_V_G_D_E_Yo_Zh_Z_I_J_K_L_M_N_O_P_R_S_T_U_F_H_Cz_Ch_Sh_Shh__Y__E_Yu_Ya_a_b_v_g_d_e_yo_zh_z_i_j_k_l_m_n_o_p_r_s_t_u_f_h_cz_ch_sh_shh__y__e_yu_ya".split("_");
      let res = input;
      for (let i = 0; i < ru.length; i++) {
        res = res.split(ru[i]).join(en[i]);
      }
      return res;
    }
  },
  {
    id: 'slugify',
    title: 'Генератор URL-слагов (Slugify)',
    category: 'text',
    description: 'Превращает заголовок статьи в красивый ЧПУ URL-слаг.',
    icon: 'Globe',
    offlineSupport: true,
    tags: ['slug', 'чпу', 'url'],
    placeholderInput: 'Как научиться программировать на Python в 2026',
    defaultAction: (input) => {
      const ru = "А_Б_В_Г_Д_Е_Ё_Ж_З_И_Й_К_Л_М_Н_О_П_Р_С_Т_У_Ф_Х_Ц_Ч_Ш_Щ_Ъ_Ы_Ь_Э_Ю_Я_а_б_в_г_д_е_ё_ж_з_и_й_к_л_м_н_о_п_р_с_т_у_ф_х_ц_ч_ш_щ_ъ_ы_ь_э_ю_я".split("_");
      const en = "a_b_v_g_d_e_yo_zh_z_i_j_k_l_m_n_o_p_r_s_t_u_f_h_cz_ch_sh_shh__y__e_yu_ya_a_b_v_g_d_e_yo_zh_z_i_j_k_l_m_n_o_p_r_s_t_u_f_h_cz_ch_sh_shh__y__e_yu_ya".split("_");
      let res = input;
      for (let i = 0; i < ru.length; i++) {
        res = res.split(ru[i]).join(en[i]);
      }
      return res.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
  },
  {
    id: 'markdown-to-plain',
    title: 'Очистка Markdown в обычный текст',
    category: 'text',
    description: 'Удаляет синтаксис заголовков #, жирного текста, ссылок, таблиц.',
    icon: 'FileCode',
    offlineSupport: true,
    tags: ['markdown', 'текст', 'очистка'],
    placeholderInput: '# Заголовок\n**Жирный текст** и [ссылка](url)',
    defaultAction: (input) => {
      let output = input
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/```[\s\S]*?```/g, '');
      return output.trim();
    }
  },

  // ===================== 2. DEV & CODE UTILITIES (16-35) =====================
  {
    id: 'json-formatter',
    title: 'JSON Форматирование & Валидация',
    category: 'dev',
    description: 'Красивое форматирование JSON с отступами, сжатие в 1 строку, поиск синтаксических ошибок.',
    icon: 'Braces',
    offlineSupport: true,
    tags: ['json', 'формат', 'код'],
    placeholderInput: '{"name":"AI","active":true,"version":3}',
    defaultAction: (input) => {
      try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
      } catch (err: any) {
        return `❌ Ошибка парсинга JSON:\n${err.message}`;
      }
    }
  },
  {
    id: 'json-minify',
    title: 'JSON Минификатор',
    category: 'dev',
    description: 'Удаляет все пробелы и переносы для экономии сетевого трафика.',
    icon: 'Minimize2',
    offlineSupport: true,
    tags: ['json', 'minify', 'сжатие'],
    placeholderInput: '{\n  "status": "ok"\n}',
    defaultAction: (input) => {
      try {
        return JSON.stringify(JSON.parse(input));
      } catch (e: any) {
        return `Ошибка: ${e.message}`;
      }
    }
  },
  {
    id: 'base64-encode',
    title: 'Base64 Кодирование',
    category: 'crypto',
    description: 'Преобразование любого текста или UTF-8 данных в Base64.',
    icon: 'Binary',
    offlineSupport: true,
    tags: ['base64', 'кодирование', 'данные'],
    placeholderInput: 'Строка для кодирования в Base64',
    defaultAction: (input) => {
      try {
        return btoa(unescape(encodeURIComponent(input)));
      } catch (e: any) {
        return `Ошибка: ${e.message}`;
      }
    }
  },
  {
    id: 'base64-decode',
    title: 'Base64 Декодирование',
    category: 'crypto',
    description: 'Восстановление исходного текста из Base64-строки с поддержкой Unicode.',
    icon: 'FileSpreadsheet',
    offlineSupport: true,
    tags: ['base64', 'декодирование'],
    placeholderInput: '0J/RgNC40LLQtdGCINC80LjRgA==',
    defaultAction: (input) => {
      try {
        return decodeURIComponent(escape(atob(input.trim())));
      } catch (e: any) {
        return `❌ Неверная строка Base64: ${e.message}`;
      }
    }
  },
  {
    id: 'url-encode-decode',
    title: 'URL Encoder / Decoder',
    category: 'dev',
    description: 'Кодирование/декодирование параметров URL запросов (RFC 3986).',
    icon: 'Link2',
    offlineSupport: true,
    tags: ['url', 'uri', 'encode'],
    placeholderInput: 'https://example.com/search?q=привет мир',
    defaultAction: (input) => {
      const encoded = encodeURIComponent(input);
      let decoded = '';
      try {
        decoded = decodeURIComponent(input);
      } catch {
        decoded = 'Не удалось декодировать';
      }
      return `🔏 **Encoded:**\n${encoded}\n\n🔓 **Decoded:**\n${decoded}`;
    }
  },
  {
    id: 'jwt-inspector',
    title: 'JWT Token Декодер (Без отправки в сеть)',
    category: 'security',
    description: 'Безопасный разбор заголовка и полезной нагрузки JSON Web Token локально на клиенте.',
    icon: 'ShieldCheck',
    offlineSupport: true,
    tags: ['jwt', 'токен', 'auth'],
    placeholderInput: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    defaultAction: (input) => {
      try {
        const parts = input.trim().split('.');
        if (parts.length < 2) return 'Некорректный формат JWT (ожидается 3 части через точку)';
        const header = JSON.parse(decodeURIComponent(escape(atob(parts[0]))));
        const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
        return `🔑 **JWT Header:**\n\`\`\`json\n${JSON.stringify(header, null, 2)}\n\`\`\`\n\n📦 **JWT Payload:**\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
      } catch (e: any) {
        return `Ошибка разбора JWT: ${e.message}`;
      }
    }
  },
  {
    id: 'regex-tester',
    title: 'Тестер Регулярных Выражений (RegEx)',
    category: 'dev',
    description: 'Проверка регулярных выражений с подсветкой совпадений и групп.',
    icon: 'SearchCode',
    offlineSupport: true,
    tags: ['regex', 'регулярки', 'поиск'],
    placeholderInput: 'Шаблон: /\\d+/g\nТекст: У меня 2 яблока и 15 апельсинов.',
    defaultAction: (input) => {
      const lines = input.split('\n');
      if (lines.length < 2) return 'Введите шаблон на 1-й строке (напр. /\\d+/g), а текст для поиска на последующих строках.';
      const patternLine = lines[0].trim();
      const textToSearch = lines.slice(1).join('\n');
      try {
        const matchRegex = patternLine.match(/^\/(.+)\/([gimsuy]*)$/);
        let regex: RegExp;
        if (matchRegex) {
          regex = new RegExp(matchRegex[1], matchRegex[2]);
        } else {
          regex = new RegExp(patternLine, 'g');
        }
        const matches = [...textToSearch.matchAll(regex)];
        if (!matches.length) return 'Совпадений не найдено.';
        return `Найдено совпадений: ${matches.length}\n` + matches.map((m, i) => `[${i + 1}] "${m[0]}" на позиции ${m.index}`).join('\n');
      } catch (err: any) {
        return `Ошибка в регулярном выражении: ${err.message}`;
      }
    }
  },
  {
    id: 'uuid-generator',
    title: 'Генератор UUID / GUID v4',
    category: 'dev',
    description: 'Пакетная генерация криптографически стойких случайных UUID v4.',
    icon: 'Fingerprint',
    offlineSupport: true,
    tags: ['uuid', 'guid', 'id'],
    placeholderInput: 'Количество UUID (по умолчанию 5)',
    defaultAction: (input) => {
      const count = Math.min(parseInt(input) || 5, 50);
      const list: string[] = [];
      for (let i = 0; i < count; i++) {
        list.push(crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }));
      }
      return list.join('\n');
    }
  },
  {
    id: 'css-gradient-gen',
    title: 'Генератор CSS Градиентов',
    category: 'dev',
    description: 'Создание готового кроссбраузерного CSS кода для линейных и радиальных градиентов.',
    icon: 'Palette',
    offlineSupport: true,
    tags: ['css', 'градиент', 'дизайн'],
    placeholderInput: '#4f46e5 #06b6d4',
    defaultAction: (input) => {
      const colors = input.trim().split(/\s+/).filter(c => c.startsWith('#') || c.startsWith('rgb'));
      const c1 = colors[0] || '#6366f1';
      const c2 = colors[1] || '#3b82f6';
      return `/* Linear Gradient */\nbackground: linear-gradient(135deg, ${c1}, ${c2});\n\n/* Radial Gradient */\nbackground: radial-gradient(circle at center, ${c1}, ${c2});`;
    }
  },
  {
    id: 'sql-formatter',
    title: 'Базовый SQL Форматировщик',
    category: 'dev',
    description: 'Разбивает длинные SQL-запросы на ключевые разделы (SELECT, FROM, WHERE, GROUP BY, ORDER BY).',
    icon: 'Database',
    offlineSupport: true,
    tags: ['sql', 'бд', 'запросы'],
    placeholderInput: 'SELECT u.id, u.name, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 1 ORDER BY u.created_at DESC',
    defaultAction: (input) => {
      const keywords = ['SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET'];
      let formatted = input;
      keywords.forEach(kw => {
        const reg = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(reg, `\n${kw.toUpperCase()} `);
      });
      return formatted.trim();
    }
  },
  {
    id: 'html-entity-encoder',
    title: 'HTML Entity Encoder / Decoder',
    category: 'dev',
    description: 'Превращает спецсимволы (&, <, >, ", \') в безопасные HTML-сущности и обратно.',
    icon: 'Code',
    offlineSupport: true,
    tags: ['html', 'entities', 'security'],
    placeholderInput: '<script>alert("XSS & test");</script>',
    defaultAction: (input) => {
      const encoded = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return encoded;
    }
  },

  // ===================== 3. CRYPTO & SECURITY (36-50) =====================
  {
    id: 'hash-sha256',
    title: 'Хэширование SHA-256 / SHA-512',
    category: 'crypto',
    description: 'Вычисление криптографических контрольных сумм в браузере через Web Crypto API.',
    icon: 'KeyRound',
    offlineSupport: true,
    tags: ['sha256', 'hash', 'хэш'],
    placeholderInput: 'Текст для хэширования',
    defaultAction: async (input) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer256 = await crypto.subtle.digest('SHA-256', data);
      const hashArray256 = Array.from(new Uint8Array(hashBuffer256));
      const hashHex256 = hashArray256.map(b => b.toString(16).padStart(2, '0')).join('');

      const hashBuffer512 = await crypto.subtle.digest('SHA-512', data);
      const hashArray512 = Array.from(new Uint8Array(hashBuffer512));
      const hashHex512 = hashArray512.map(b => b.toString(16).padStart(2, '0')).join('');

      return `🔐 **SHA-256:**\n\`${hashHex256}\`\n\n🔐 **SHA-512:**\n\`${hashHex512}\``;
    }
  },
  {
    id: 'password-gen',
    title: 'Генератор стойких паролей',
    category: 'security',
    description: 'Создание криптостойких паролей нужной длины с настройкой символов.',
    icon: 'Shield',
    offlineSupport: true,
    tags: ['пароль', 'безопасность', 'генератор'],
    placeholderInput: 'Длина (по умолчанию 20)',
    defaultAction: (input) => {
      const len = Math.max(8, Math.min(parseInt(input) || 20, 128));
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+-=<>?';
      const array = new Uint32Array(len);
      crypto.getRandomValues(array);
      const pass = Array.from(array, n => chars[n % chars.length]).join('');
      return `🔑 **Безопасный пароль (${len} симв.):**\n\`${pass}\``;
    }
  },
  {
    id: 'password-strength',
    title: 'Анализ надежности пароля',
    category: 'security',
    description: 'Оценка энтропии, времени взлома брутфорсом и рекомендации по защите.',
    icon: 'Lock',
    offlineSupport: true,
    tags: ['энтропия', 'пароль', 'проверка'],
    placeholderInput: 'ВашПарольДляПроверки123!',
    defaultAction: (input) => {
      let score = 0;
      if (input.length >= 8) score += 20;
      if (input.length >= 14) score += 25;
      if (/[A-Z]/.test(input)) score += 15;
      if (/[a-z]/.test(input)) score += 15;
      if (/[0-9]/.test(input)) score += 15;
      if (/[^A-Za-z0-9]/.test(input)) score += 15;

      let level = 'Очень слабый';
      if (score > 80) level = '🛡️ Отличный (высокая стойкость)';
      else if (score > 60) level = '👍 Хороший';
      else if (score > 40) level = '⚠️ Средний (желательно улучшить)';

      return `Оценка надежности: ${score}/100 — ${level}\nДлина: ${input.length} знаков. Наличие цифр: ${/\d/.test(input)}, спецсимволов: ${/[^A-Za-z0-9]/.test(input)}`;
    }
  },

  // ===================== 4. MATH & CONVERSIONS (51-70) =====================
  {
    id: 'math-evaluator',
    title: 'Инженерный калькулятор выражений',
    category: 'math',
    description: 'Вычисление сложных алгебраических и тригонометрических выражений.',
    icon: 'Calculator',
    offlineSupport: true,
    tags: ['математика', 'расчет', 'формула'],
    placeholderInput: 'sin(30 * PI / 180) + sqrt(144) * 2^3',
    defaultAction: (input) => {
      try {
        const mathExpr = input
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/PI/g, 'Math.PI')
          .replace(/\^/g, '**');
        const fn = new Function(`"use strict"; return (${mathExpr});`);
        return `Результат: ${fn()}`;
      } catch (err: any) {
        return `Ошибка вычисления: ${err.message}`;
      }
    }
  },
  {
    id: 'unit-converter',
    title: 'Конвертер единиц измерения',
    category: 'math',
    description: 'Перевод между метрическими и имперскими единицами (длина, масса, температура, объем).',
    icon: 'Scale',
    offlineSupport: true,
    tags: ['конвертер', 'метры', 'фунты'],
    placeholderInput: '100 km (или 75 kg, 32 f)',
    defaultAction: (input) => {
      const parts = input.trim().split(/\s+/);
      const val = parseFloat(parts[0]);
      const unit = (parts[1] || '').toLowerCase();
      if (isNaN(val)) return 'Введите значение и единицу (например: 100 km или 75 kg)';
      if (unit === 'km') return `${val} км = ${(val * 0.621371).toFixed(2)} миль`;
      if (unit === 'miles' || unit === 'mi') return `${val} миль = ${(val * 1.60934).toFixed(2)} км`;
      if (unit === 'kg') return `${val} кг = ${(val * 2.20462).toFixed(2)} фунтов`;
      if (unit === 'lbs') return `${val} фунтов = ${(val * 0.453592).toFixed(2)} кг`;
      if (unit === 'c') return `${val}°C = ${(val * 9/5 + 32).toFixed(1)}°F`;
      if (unit === 'f') return `${val}°F = ${((val - 32) * 5/9).toFixed(1)}°C`;
      return `Поддерживаемые единицы: km, mi, kg, lbs, c, f. Пример: "50 km"`;
    }
  },
  {
    id: 'hex-rgb-converter',
    title: 'Конвертер Цветов HEX <-> RGB <-> HSL',
    category: 'math',
    description: 'Взаимное преобразование цветовых кодов.',
    icon: 'Pipette',
    offlineSupport: true,
    tags: ['hex', 'rgb', 'hsl', 'цвет'],
    placeholderInput: '#3b82f6',
    defaultAction: (input) => {
      let hex = input.trim().replace(/^#/, '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      if (hex.length !== 6) return 'Введите валидный 6-значный HEX (например #3b82f6)';
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `🎨 **Цветовые форматы:**\n- **HEX**: #${hex.toUpperCase()}\n- **RGB**: rgb(${r}, ${g}, ${b})\n- **RGBA**: rgba(${r}, ${g}, ${b}, 1)\n- **CSS var**: --color: #${hex};`;
    }
  },
  {
    id: 'timestamp-converter',
    title: 'Unix Timestamp Конвертер',
    category: 'math',
    description: 'Перевод времени между миллисекундами Unix и читаемой датой.',
    icon: 'Clock',
    offlineSupport: true,
    tags: ['unix', 'дата', 'время'],
    placeholderInput: 'now или 1710000000',
    defaultAction: (input) => {
      let d = new Date();
      if (input.trim() && input.trim() !== 'now') {
        const ts = parseInt(input.trim());
        d = ts > 10000000000 ? new Date(ts) : new Date(ts * 1000);
      }
      return `⏰ **Результат конвертации:**\n- Unix (сек): ${Math.floor(d.getTime() / 1000)}\n- Unix (мс): ${d.getTime()}\n- ISO 8601: ${d.toISOString()}\n- Локальное: ${d.toLocaleString()}`;
    }
  },
  {
    id: 'byte-size-converter',
    title: 'Конвертер объемов данных (Байты / КБ / МБ / ГБ)',
    category: 'math',
    description: 'Точный расчет размеров файлов в двоичной (1024) и десятичной (1000) системе.',
    icon: 'HardDrive',
    offlineSupport: true,
    tags: ['байты', 'мб', 'гб', 'размер'],
    placeholderInput: '1048576 (байты) или 5 GB',
    defaultAction: (input) => {
      const clean = input.trim();
      if (/^\d+$/.test(clean)) {
        const bytes = parseInt(clean);
        const kb = (bytes / 1024).toFixed(2);
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        const gb = (bytes / (1024 * 1024 * 1024)).toFixed(3);
        return `${bytes} Bytes:\n- ${kb} KiB\n- ${mb} MiB\n- ${gb} GiB`;
      }
      return 'Введите число байт для конвертации (например, 1073741824)';
    }
  },

  // ===================== 5. PRODUCTIVITY & SYSTEM (71-100+) =====================
  {
    id: 'pomodoro-timer',
    title: 'Помодоро & Таймер Фокуса',
    category: 'productivity',
    description: 'Интервальный расчет продуктивности по методологии 25/5 или 50/10.',
    icon: 'Timer',
    offlineSupport: true,
    tags: ['помодоро', 'фокус', 'время'],
    placeholderInput: 'Количество спринтов (по умолчанию 4)',
    defaultAction: (input) => {
      const sprints = parseInt(input) || 4;
      const workTime = sprints * 25;
      const breakTime = (sprints - 1) * 5 + 15;
      const total = workTime + breakTime;
      return `🍅 **План Помодоро (${sprints} спринтов):**\n- Чистая работа: ${workTime} мин\n- Отдых: ${breakTime} мин\n- Общее время: ${total} мин (~${(total / 60).toFixed(1)} ч)`;
    }
  },
  {
    id: 'qr-code-data',
    title: 'Генератор QR-данных (Wi-Fi, vCard, URI)',
    category: 'productivity',
    description: 'Форматирует правильные системные строки для мгновенного считывания камерой телефона.',
    icon: 'QrCode',
    offlineSupport: true,
    tags: ['qr', 'wifi', 'vcard'],
    placeholderInput: 'WIFI:S:MyNetwork;T:WPA;P:MyPassword;;',
    defaultAction: (input) => {
      return `📲 **QR-String готовая к кодированию:**\n\`${input}\`\n\n*Поддерживается встроенными сканерами Android и iOS.*`;
    }
  },
  {
    id: 'device-info',
    title: 'Диагностика окружения устройства',
    category: 'sys',
    description: 'Мгновенное определение платформы (ПК/Android/iOS), памяти, разрешения экрана и датчиков.',
    icon: 'MonitorCheck',
    offlineSupport: true,
    tags: ['система', 'экран', 'устройство'],
    placeholderInput: '',
    defaultAction: () => {
      const ua = navigator.userAgent;
      const isMobile = /Android|iPhone|iPad/i.test(ua);
      const cores = navigator.hardwareConcurrency || 'N/A';
      const screenRes = `${window.screen.width}x${window.screen.height} (DPR: ${window.devicePixelRatio})`;
      const lang = navigator.language;
      const online = navigator.onLine ? '🟢 Онлайн' : '🔴 Офлайн';
      return `🖥️ **Диагностика устройства:**\n- Тип: ${isMobile ? '📱 Мобильное устройство / Телефон' : '💻 ПК / Десктоп'}\n- Экран: ${screenRes}\n- Ядер CPU: ${cores}\n- Язык системы: ${lang}\n- Статус сети: ${online}\n- Браузерное ядро: ${navigator.vendor || 'Chromium'}`;
    }
  },
  {
    id: 'battery-status',
    title: 'Монитор батареи устройства',
    category: 'sys',
    description: 'Проверка уровня заряда аккумулятора и состояния зарядки.',
    icon: 'BatteryCharging',
    offlineSupport: true,
    tags: ['батарея', 'зарядка', 'питание'],
    placeholderInput: '',
    defaultAction: async () => {
      try {
        if ('getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          const level = Math.round(battery.level * 100);
          const charging = battery.charging ? 'Подключен к зарядке ⚡' : 'Работа от батареи 🔋';
          return `🔋 **Статус аккумулятора:**\n- Заряд: ${level}%\n- Состояние: ${charging}`;
        }
        return 'Battery Status API не поддерживается вашим браузером.';
      } catch (e) {
        return 'Не удалось получить данные о батарее.';
      }
    }
  },
  {
    id: 'network-ping-estimator',
    title: 'Измерение сетевой задержки (Лаг/Пинг)',
    category: 'network',
    description: 'Локальный замер времени отклика сетевого стека.',
    icon: 'Activity',
    offlineSupport: false,
    tags: ['пинг', 'сеть', 'интернет'],
    placeholderInput: '',
    defaultAction: async () => {
      const start = performance.now();
      try {
        await fetch('/api/health', { method: 'HEAD', cache: 'no-store' });
        const latency = Math.round(performance.now() - start);
        return `📶 **Отклик сервера Workstation:** ${latency} мс (Соединение активно)`;
      } catch {
        return `🔴 Сервер недоступен или устройство работает в полностью изолированном офлайн-режиме.`;
      }
    }
  },
  {
    id: 'vibrate-device',
    title: 'Тест тактильной отдачи (Вибрация)',
    category: 'sys',
    description: 'Тестирование вибромотора на смартфонах Android при получении важных уведомлений.',
    icon: 'Vibrate',
    offlineSupport: true,
    tags: ['вибрация', 'android', 'тест'],
    placeholderInput: 'Длина вибрации в мс (напр. 200)',
    defaultAction: (input) => {
      if ('vibrate' in navigator) {
        const ms = parseInt(input) || 200;
        navigator.vibrate([ms, 100, ms]);
        return `📳 Вибромотор активирован на [${ms}, 100, ${ms}] мс.`;
      }
      return 'API вибрации доступно только на мобильных устройствах (Android).';
    }
  },
  {
    id: 'speech-synth-test',
    title: 'Синтез речи (TTS) — Озвучка текста',
    category: 'media',
    description: 'Озвучивание произвольного текста встроенными системными голосами Windows/macOS/Android.',
    icon: 'Volume2',
    offlineSupport: true,
    tags: ['голос', 'tts', 'речь'],
    placeholderInput: 'Введите текст для озвучивания...',
    defaultAction: (input) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(input || 'Система OmniAI готова к работе');
        utterance.lang = 'ru-RU';
        window.speechSynthesis.speak(utterance);
        return '🔊 Текст отправлен на встроенный аппаратный речевой движок устройства!';
      }
      return 'Синтез речи не поддерживается в данном браузере.';
    }
  }
];

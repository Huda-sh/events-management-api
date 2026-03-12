import { Injectable } from '@nestjs/common';
import { messages } from './messages';

@Injectable()
export class I18nService {
  translate(key: string, lang = 'en', vars: Record<string, any> = {}) {
    const segments = key.split('.');
    let node: any = messages[lang] ?? messages.en;

    for (const segment of segments) {
      node = node?.[segment];
      if (node === undefined) {
        break;
      }
    }

    let text = typeof node === 'string' ? node : key;

    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });

    return text;
  }
}

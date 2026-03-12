import {
  Injectable,
  Scope,
  BadRequestException,
  Inject,
  ValidationPipe,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { ValidationError } from 'class-validator';
import { I18nService } from '../../i18n/i18n.service';

const CONSTRAINT_MESSAGE_KEYS: Record<string, string> = {
  isNotEmpty: 'validation.required',
  isUrl: 'validation.invalidUrl',
  isEnum: 'validation.invalidEnum',
  isString: 'validation.invalidType',
  isEmail: 'validation.invalidEmail',
  isDateString: 'validation.invalidDate',
  isInt: 'validation.invalidType',
  minLength: 'validation.minLength',
  matches: 'validation.passwordStrength',
};

@Injectable({ scope: Scope.REQUEST })
export class LocalizedValidationPipe extends ValidationPipe {
  constructor(
    private readonly i18n: I18nService,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    });

    this.exceptionFactory = (errors: ValidationError[]) => {
      const lang =
        (this.request.headers['accept-language'] as string | undefined)
          ?.split(',')[0]
          ?.trim() || 'en';

      const messages = errors.flatMap((error) =>
        LocalizedValidationPipe.flattenValidationError(error, lang, this.i18n),
      );

      return new BadRequestException(messages);
    };
  }

  private static flattenValidationError(
    error: ValidationError,
    lang: string,
    i18n: I18nService,
  ): string[] {
    const property = error.property;
    const constraints = error.constraints || {};

    const messages: string[] = [];

    for (const constraintKey of Object.keys(constraints)) {
      const key =
        CONSTRAINT_MESSAGE_KEYS[constraintKey] || 'validation.invalidType';

      const vars: Record<string, any> = { property };

      if (constraintKey === 'minLength') {
        const match = constraints[constraintKey].match(/(\d+)/);
        if (match) {
          vars.min = match[1];
        }
      }

      if (constraintKey === 'isEnum') {
        const match = constraints[constraintKey].match(/:\s*(.+)$/);
        if (match) {
          vars.values = match[1];
        }
      }

      messages.push(i18n.translate(key, lang, vars));
    }

    if (error.children && error.children.length) {
      return messages.concat(
        ...error.children.map((child) =>
          LocalizedValidationPipe.flattenValidationError(child, lang, i18n),
        ),
      );
    }

    return messages;
  }
}

import { Module } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Module({
  providers: [
    {
      provide: 'SENTRY',
      useFactory: () => {
        Sentry.init({
          dsn: process.env.SENTRY_DSN || '',
          environment: process.env.NODE_ENV || 'development',
          tracesSampleRate: 1.0,
        });
        return Sentry;
      },
    },
  ],
  exports: ['SENTRY'],
})
export class SentryModule {}

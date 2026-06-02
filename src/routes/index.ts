import type { FastifyInstance } from 'fastify';
import { healthRoutes }   from './health';
import { authRoutes }     from '../modules/auth/auth.routes';
import { articleRoutes }  from '../modules/articles/articles.routes';
import { categoryRoutes } from '../modules/categories/categories.routes';
import { authorRoutes }   from '../modules/authors/authors.routes';
import { userRoutes }     from '../modules/users/users.routes';
import { slotRoutes }     from '../modules/slots/slots.routes';
import { settingRoutes }  from '../modules/settings/settings.routes';
import { adminRoutes }    from '../modules/admin/admin.routes';

export async function routes(app: FastifyInstance) {
  // ── Infraestrutura ────────────────────────────────────────────────────────
  app.register(healthRoutes);

  // ── Auth (sem middleware) ─────────────────────────────────────────────────
  app.register(authRoutes, { prefix: '/auth' });

  // ── Domínio ───────────────────────────────────────────────────────────────
  app.register(articleRoutes,  { prefix: '/articles'   });
  app.register(categoryRoutes, { prefix: '/categories' });
  app.register(authorRoutes,   { prefix: '/authors'    });
  app.register(userRoutes,     { prefix: '/users'      });
  app.register(slotRoutes,     { prefix: '/slots'      });
  app.register(settingRoutes,  { prefix: '/settings'   });
  app.register(adminRoutes,    { prefix: '/admin'      });
}

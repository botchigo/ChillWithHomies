# Architecture refactor

## Current architecture

The app uses Expo Router with route components in `app/`. A single `DemoAppProvider` owns authentication, persisted demo data, social relationships, sessions, chat, billing, trust, and safety actions. `data/demo-data.ts` combines domain types, seed data, constants, filtering, formatting, and business rules.

## Problems found

- Domain boundaries are hidden behind one context and one data module.
- Reusable validation and session rules live inside screens or the provider.
- Large route files mix orchestration, business rules, feature UI, and styles.
- Server-like demo state and global client state share one context.
- Two UI kits coexist; the main app uses `app-primitives`, while the design-system preview and toast use `amber-kit`.
- Legacy KYC routes remain available as deep links, although the active signup route no longer enters that flow.
- Hydration and draft cleanup contain silent error paths.

No circular dependency was found in the current import direction: routes depend on UI/context/data, context depends on data, and data is standalone.

## Target architecture

Expo Router files remain in `app/` as route adapters. Feature code moves into `src/features`, while cross-feature persistence and state contracts live in `src/shared`. The project must not create `src/app`, because Expo Router would treat it as the route root and ignore the existing `app/` routes.

```text
app/                         # Expo Router route adapters
src/
  features/
    auth/
    profile/
    sessions/
    chat/
    trust/
    safety/
    notifications/
  shared/
    components/
    persistence/
    types/
    utils/
data/                        # demo seed and temporary compatibility exports
```

Dependencies should flow from routes/components to feature hooks, then pure feature services. The provider acts as the local demo repository until a backend exists.

## Migration phases

1. Extract domain types, constants, and pure business rules.
2. Extract auth/onboarding validation and constants.
3. Isolate persisted-state migration and storage errors.
4. Add focused feature hooks so screens do not consume the full context contract.
5. Split large feature UI by responsibility where it improves cohesion.
6. Remove compatibility exports and verified dead template code.

Each phase must keep navigation, AsyncStorage keys, hydration timing, and user-visible behavior stable, and must pass typecheck, lint, and production export before cleanup.

## Risks

- Changing the persisted state schema can strand existing local data.
- Moving route files would change Expo Router paths, so route files stay in place.
- Splitting the provider too aggressively can alter action ordering or stale-closure behavior.
- Legacy KYC screens may still be used through direct links and are not removed without a product decision.

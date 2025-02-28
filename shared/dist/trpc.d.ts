export declare const router: <TProcRouterRecord extends import("@trpc/server").ProcedureRouterRecord>(procedures: TProcRouterRecord) => import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
    ctx: object;
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
}>, TProcRouterRecord>;
export declare const publicProcedure: import("@trpc/server").ProcedureBuilder<{
    _config: import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>;
    _ctx_out: object;
    _input_in: typeof import("@trpc/server").unsetMarker;
    _input_out: typeof import("@trpc/server").unsetMarker;
    _output_in: typeof import("@trpc/server").unsetMarker;
    _output_out: typeof import("@trpc/server").unsetMarker;
    _meta: object;
}>;
export declare const appRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
    ctx: object;
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
}>, {
    auth: import("@trpc/server").Router<import("@trpc/server/dist/core/router").RouterDef<import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {}, {
        queries: {};
        mutations: {};
        subscriptions: {};
    }>>;
    user: import("@trpc/server").Router<import("@trpc/server/dist/core/router").RouterDef<import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {}, {
        queries: {};
        mutations: {};
        subscriptions: {};
    }>>;
    house: import("@trpc/server").Router<import("@trpc/server/dist/core/router").RouterDef<import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {}, {
        queries: {};
        mutations: {};
        subscriptions: {};
    }>>;
    food: import("@trpc/server").Router<import("@trpc/server/dist/core/router").RouterDef<import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {}, {
        queries: {};
        mutations: {};
        subscriptions: {};
    }>>;
    event: import("@trpc/server").Router<import("@trpc/server/dist/core/router").RouterDef<import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {}, {
        queries: {};
        mutations: {};
        subscriptions: {};
    }>>;
    adhan: import("@trpc/server").Router<import("@trpc/server/dist/core/router").RouterDef<import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {}, {
        queries: {};
        mutations: {};
        subscriptions: {};
    }>>;
    committee: import("@trpc/server").Router<import("@trpc/server/dist/core/router").RouterDef<import("@trpc/server").RootConfig<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {}, {
        queries: {};
        mutations: {};
        subscriptions: {};
    }>>;
}>;
export type AppRouter = typeof appRouter;

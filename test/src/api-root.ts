import { filters, get, guard, intercept, post, Resource, Router, routes, serve } from "@koa-stack/router";
import { Context, Next } from "koa";

async function intrerceptor1(this: any, ctx: Context, endpoint: (ctx: Context) => Promise<any>) {
    const result = await endpoint(ctx);
    if (this instanceof ApiIntercept) {
        return "intercepted: " + (result || '');
    } else {
        return "bug: not an instance of ApiIntercept";
    }

}

@intercept(intrerceptor1)
export class ApiIntercept extends Resource {

    @get('/test1')
    getIntercepted(_ctx: Context) {
        if (this instanceof ApiIntercept) {
            return 'hello';
        } else {
            return 'bug: not an instance of ApiIntercept';
        }
    }
}


class UsersApi extends Resource {
    @get()
    getUsersIndex(ctx: Context) {
        ctx.body = 'UsersApi root'
    }
}

@filters(
    (_ctx: Context, next: Next) => next(), // first filter is doing nothing
    async (ctx, next) => {
        await next();
        ctx.status = 204;
    })
class NoContent extends Resource {
    @get()
    getUsersIndex(ctx: Context) {
        ctx.body = 'no content'
    }
}

@routes({
    '/users1': UsersApi,
    '/users2': new UsersApi(),
    "/noContent": NoContent
})
export class BaseResource extends Resource {

    @guard
    onAccess(ctx: Context) {
        if (ctx.request.header.authorization === 'none') {
            return false;
        }
        ctx.response.set({ 'on-access': 'BaseResource' });
        return true;
    }

    @get('/base')
    getHelloFromBase(ctx: Context) {
        ctx.body = 'hello base';
    }

    @get('/overwrite')
    getOverwriteBase(ctx: Context) {
        ctx.body = 'base endpoint';
    }

    @serve('/index.txt')
    getTextIndex() {
        return '/data/index.txt';
    }

    @serve('/static')
    getTextIndex2() {
        return '/data';
    }

    setup(router: Router): void {
        super.setup(router);
        router.mount('/users3', UsersApi);
    }
}

function pusBodyPart(ctx: Context, part: string) {
    if (!ctx.__bodyParts) {
        ctx.__bodyParts = [];
    }
    ctx.__bodyParts.push(part);
}

@filters(async (ctx, next) => {
    pusBodyPart(ctx, "resource");
    await next()
})
@routes({
    '/intercept': ApiIntercept
})
export class ApiRoot extends BaseResource {
    // overwrite access guard
    onAccess(ctx: Context) {
        ctx.response.set({ 'on-access': 'ApiRoot' });
        return true;
    }

    @get('/hello')
    getHelloEndpoint(ctx: Context) {
        ctx.body = 'hello';
    }

    @get('/return')
    getPayloadWithReturn(_ctx: Context) {
        return 'returned payload';
    }

    // correct way to overwrite endpoint
    getOverwriteBase(ctx: Context) {
        ctx.body = 'ApiRoot overwrite';
    }

    @post('/optional-body')
    postBody(ctx: Context) {
        if (ctx.hasPayload) {
            ctx.body = 'has body';
        } else {
            ctx.body = 'no body';
        }
    }

    @post('/null-body')
    async parseNullBody(ctx: Context) {
        const payload = (await ctx.payload);
        const json = payload.json;
        ctx.body = payload.isEmpty && json === undefined ? "null body" : "unexpected body";
    }


    @get("/filters")
    @filters(async (ctx, next) => {
        pusBodyPart(ctx, "endpoint");
        await next()
    })
    async filters(ctx: Context) {
        return ctx.__bodyParts ? ctx.__bodyParts.join(",") : "no parts";
    }

    @get("/filters")
    @filters(async (ctx, next) => {
        const paylaod = await ctx.payload;
        if (paylaod.text === "knock knock") {
            await next()
        } else {
            ctx.status = 403;
        }
    })
    @post("/filters/knock")
    protectedEndpoint() {
        return "hello";
    }

}


export class ApiRootBad extends BaseResource {

    @get()
    getRootEndpoint(ctx: Context) {
        ctx.body = 'ApiRootBad root';
    }

    /**
     * bad way to overwrite the guard.
     * It works but you don't need to define a new guard.
     * You should simply overwrite the method
     */
    @guard
    onAccess2(ctx: Context) {
        ctx.response.set({ 'on-access': 'ApiRootBad' });
        return true;
    }

    /**
     * Bas way to overwrite a base endpoint.
     * Even if it works, you should overwrite the method and not redefine the route
     * @param ctx
     */
    @get('/overwrite')
    getOwnOverwriteBase(ctx: Context) {
        ctx.body = 'ApiRootBad overwrite';
    }

}


export class ChildApi extends BaseResource {

    @get('/')
    getIndex(ctx: Context) {
        ctx.body = 'ChildApi: ' + ctx.params.name;
    }

}

@routes({
    '/child/:name': ChildApi
})
export class OtherApi extends BaseResource {

    @get('/')
    getIndex(ctx: Context) {
        ctx.body = 'OtherApi root'
    }

}

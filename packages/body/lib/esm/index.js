import readRawBody from 'raw-body';
import inflate from 'inflation';
import qs from 'qs';
import formidable from 'formidable';
function parseMultipartBody(koaRequest, opts) {
    const form = formidable(opts.formidable);
    return new Promise((resolve, reject) => {
        form.parse(koaRequest.req, (err, fields, files) => {
            if (err) {
                reject(err);
            }
            else {
                resolve({
                    params: fields,
                    files: files
                });
            }
        });
    });
}
async function getRawBodyText(koaRequest, opts) {
    const len = koaRequest.length;
    let encoding = koaRequest.headers['content-encoding'];
    if (len && !encoding) {
        opts.length = len;
    }
    // TODO how to detect custom encoding on content type to ser encoding for readRawBody
    return (await readRawBody(inflate(koaRequest.req, opts.inflate), opts)).toString( /*which charset?*/);
}
/**
 * Request body class
 * json
 *
 */
export class LazyBody {
    constructor(ctx, type, data, raw, files) {
        Object.defineProperty(this, "ctx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "raw", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "files", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.ctx = ctx;
        this.type = type;
        this.data = data;
        this.raw = raw;
        this.files = files;
    }
    get isEmpty() {
        return this.raw === '';
    }
    assertJSON(statusCode, message) {
        if (this.type !== FormType.json) {
            this.ctx.throw(statusCode || 415, message);
        }
    }
    assertXML(statusCode, message) {
        if (this.type !== FormType.xml) {
            this.ctx.throw(statusCode || 415, message);
        }
    }
    /**
     * Assert body type is urlencoded
     * @param {*} statusCode
     * @param {*} message
     */
    assertForm(statusCode, message) {
        if (this.type !== FormType.form) {
            this.ctx.throw(statusCode || 415, message);
        }
    }
    assertMultipart(statusCode, message) {
        if (this.type !== FormType.multipart) {
            this.ctx.throw(statusCode || 415, message);
        }
    }
    assertText(statusCode, message) {
        if (this.type !== FormType.text) {
            this.ctx.throw(statusCode || 415, message);
        }
    }
    /**
     * Assert that body type is either multipart or urlencoded
     * @param {*} statusCode
     * @param {*} message
     */
    assertParams(statusCode, message) {
        if (this.type !== FormType.form && this.type !== FormType.multipart) {
            this.ctx.throw(statusCode || 415, message);
        }
    }
    get text() {
        return this.raw;
    }
    get json() {
        return this.isJSON ? this.data : undefined;
    }
    get xml() {
        return this.isXML ? this.data : undefined;
    }
    get params() {
        switch (this.type) {
            case FormType.form:
            case FormType.multipart:
                return this.data;
            default: return undefined;
        }
    }
    get isForm() {
        return this.type === FormType.form;
    }
    get isJSON() {
        return this.type === FormType.json;
    }
    get isXML() {
        return this.type === FormType.xml;
    }
    get isMultipart() {
        return this.type === FormType.multipart;
    }
    get isText() {
        return this.type === FormType.text;
    }
    static install(koa, opts = {}) {
        opts.encoding = opts.encoding || 'utf8';
        opts.limit = opts.limit || '1mb';
        Object.defineProperty(koa.request, 'body', {
            get() {
                if (!this._body) {
                    this._body = createBody(this, opts);
                }
                return this._body;
            },
            // be able to work along code using koa2-formidable (wich sets the body property pf the request)
            set(body) {
                this._body = body;
            }
        });
        // payload is an alias to request.body
        Object.defineProperty(koa.context, 'payload', {
            get() {
                return this.request.body;
            },
            set(body) {
                this.request.body = body;
            }
        });
        // payload is an alias to request.hasBody in v3
        Object.defineProperty(koa.context, 'hasPayload', {
            get() {
                return this.request.length > 0 ||
                    this.request.headers['transfer-encoding'] != null;
            },
        });
    }
}
var FormType;
(function (FormType) {
    FormType[FormType["multipart"] = 0] = "multipart";
    FormType[FormType["form"] = 1] = "form";
    FormType[FormType["json"] = 2] = "json";
    FormType[FormType["xml"] = 3] = "xml";
    FormType[FormType["text"] = 4] = "text";
})(FormType || (FormType = {}));
async function createBody(koaRequest, opts) {
    let type, data, raw, files = null;
    if (koaRequest.is('multipart')) {
        raw = '';
        const result = await parseMultipartBody(koaRequest, opts);
        data = result.params || {};
        files = result.files || {};
        type = FormType.multipart;
    }
    else if (koaRequest.is('urlencoded')) {
        // by default we use qs. You can replace the querystring parser using opts.form
        raw = await getRawBodyText(koaRequest, opts);
        data = opts.form ? opts.form(raw) : qs.parse(raw);
        type = FormType.form;
    }
    else if (koaRequest.is('json', '+json')) {
        // by default we use JSON.parse. You can replace the json parser using opts.json
        if (koaRequest.ctx.hasPayload) {
            raw = await getRawBodyText(koaRequest, opts);
        }
        else {
            raw = '';
        }
        if (raw === '') { // for JSON we support no content posted
            data = undefined;
        }
        else {
            data = opts.json ? opts.json(raw) : JSON.parse(raw);
        }
        type = FormType.json;
    }
    else if (koaRequest.is('xml', '+xml')) {
        // by default fast-xml-parser is used - to change the parser you should provde an xml parser through opts.xml
        raw = await getRawBodyText(koaRequest, opts);
        if (opts.xml) {
            data = opts.xml(raw);
        }
        else {
            let parser = await tryGetXmlParser();
            if (parser) {
                data = parser.parse(raw);
            }
        }
        type = FormType.xml;
    }
    else if (koaRequest.is('text/*')) {
        raw = await getRawBodyText(koaRequest, opts);
        type = FormType.text;
    }
    else {
        type = FormType.text;
        // if has body
        console.log();
        if (koaRequest.ctx.hasPayload) {
            raw = await getRawBodyText(koaRequest, opts);
        }
        else {
            raw = '';
        }
    }
    return new LazyBody(koaRequest.ctx, type, data, raw, files);
}
/**
 * Use fast-xml-parser if available
 * @returns
 */
async function tryGetXmlParser() {
    try {
        const mod = await import("fast-xml-parser");
        return new mod.XMLParser();
    }
    catch (err) {
        console.warn("Could not find fast-xml-parser. You need to pass xml option for a custom parser", err);
        return undefined;
    }
}
//# sourceMappingURL=index.js.map
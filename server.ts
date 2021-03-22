// @ts-ignore
import {red, bold, cyan, green} from "https://deno.land/std@v0.19.0/fmt/colors.ts";
// @ts-ignore
import {Application, HttpError, send, Status} from 'https://deno.land/x/oak/mod.ts';

const app = new Application();

app.use(async (context, next) => {
  try {
    await next();
  } catch(e) {
    if (e instanceof HttpError) {
      context.response.status = e.status as any;
        context.response.body = `
          <!DOCTYPE html>
          <html>
            <body>
              <h1> ${e.status} - ${e.expose ? e.message : Status[e.status]}</h1>
            </body>
          </html>
        `
    } else if (e instanceof Error) {
      context.response.status = 500;
      context.response.body = `
      <!DOCTYPE html>
      <html>
        <body>
          <h1> 500- Internal Server Error</h1>
        </body>
      </html>
    `
    }
    console.log("unhandled Error:", red(bold(e.message)));
    console.log(e.stack);
  }
})

app.use(async (context, next) => {
  await next();
  const responseTime = context.response.headers.get('X-Response-Time');
  console.log(`${green(context.request.method)} ${cyan(context.request.url)}- ${bold(String(responseTime))}`)
})

app.use(async (context, next) => {
  const start = Date.now();
  await next();
  const milliseconds = Date.now() - start;
  context.response.headers.set(`X-Response-Time`,`${milliseconds}ms`);
})

app.use(async (context, next) => {
  await send(context, context.request.path, {
    root: `${Deno.cwd()}/static`, 
    index: `index.html`
  })
})

const address = "127.0.0.1:8000";
console.log(`Start listening on Port ${address}`)
app.listen(address);

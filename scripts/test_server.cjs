const { spawn, spawnSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const testCs = `
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

class TestServer
{
    static void Main()
    {
        TcpListener l = new TcpListener(IPAddress.Loopback, 0);
        l.Start();
        int port = ((IPEndPoint)l.LocalEndpoint).Port;
        l.Stop();

        HttpListener listener = new HttpListener();
        listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
        listener.Start();

        Console.WriteLine("PORT:" + port);
        Console.Out.Flush();

        while (true)
        {
            HttpListenerContext ctx = listener.GetContext();
            byte[] body = Encoding.UTF8.GetBytes("<html><body><h1>LOCKIN TEST OK</h1></body></html>");
            ctx.Response.ContentType = "text/html; charset=utf-8";
            ctx.Response.ContentLength64 = body.Length;
            ctx.Response.AddHeader("Access-Control-Allow-Origin", "*");
            ctx.Response.OutputStream.Write(body, 0, body.Length);
            ctx.Response.Close();
        }
    }
}
`;

fs.writeFileSync('TestServer.cs', testCs);
const csc = 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';
const res = spawnSync(csc, ['/target:exe', 'TestServer.cs'], { encoding: 'utf-8' });
console.log('Compile success:', res.status === 0);

if (res.status === 0) {
  const proc = spawn('TestServer.exe', [], { stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', (d) => {
    const text = d.toString();
    console.log('Server output:', text);
    const m = text.match(/PORT:(\d+)/);
    if (m) {
      const port = m[1];
      console.log('Fetching http://127.0.0.1:' + port + '/ ...');
      http.get('http://127.0.0.1:' + port + '/', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          console.log('HTTP STATUS:', res.statusCode);
          console.log('BODY:', data);
          proc.kill();
          try { fs.unlinkSync('TestServer.exe'); } catch (e) { }
          try { fs.unlinkSync('TestServer.cs'); } catch (e) { }
          process.exit(0);
        });
      }).on('error', (err) => {
        console.error('HTTP GET error:', err);
        proc.kill();
        process.exit(1);
      });
    }
  });
  proc.stderr.on('data', d => console.error('Server err:', d.toString()));
}

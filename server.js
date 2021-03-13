import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const server = express();
server.use(bodyParser.json());

const port = 9000;

/**
 * How does this very simple cors proxy server work?
 * 1. Your script hosted on Web makes a call to your proxy server that you controls - passing along the real source that it wants to hit
 * 2. Your proxy server then makes a http(s) call to the real source. This will work since server-to-server doesn't have CORS protection like browser-to-server (Unless if the real source has whitelisting).
 * 3. Your proxy server will now send a CORS header with the origin matching your Web host - which will pass the browser CORS protection. After that, it sends the result it got from real source to your script on Web.
 * 4. Voila!
 */
server.get('/proxy', (req, res) => {
  const { origin } = req.headers;
  // This is the real source that requester wants to access
  const { target } = req.query;

  const decodedTarget = decodeURIComponent(target);

  res.header("Access-Control-Allow-Origin", origin);

  axios.get(decodedTarget)
    .then((result) => {
      // send CORS header with origin
      res.status(200).send(result.data).end();
    })
    .catch((err) => {
      console.log('Proxy failed! ', err);
      res.status(400).send({
        error: 'Unable to proxy your request' }).end();
    });
});

server.listen(port, () => {
  console.log(`CORS Proxy server started at http://localhost:${port}`)
});

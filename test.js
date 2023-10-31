const express = require('express');
const app = express();
const port = 3000;   //  指定一個 port 給這個 app

app.get('/', (req, res) => {
    res.send('Hello World!');
  })
  
  app.get('/hello', (req, res) => {
    res.send('Hello man');
  })

app.listen(port, () => {    //  加上一個監聽器來監聽這個 port
  console.log(`Example app listening at http://localhost:${port}`)
})
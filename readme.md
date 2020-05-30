# request agregator

## how to run

````bash
npm i
````
````bash
npm start
````

## how to test

````bash
npm t
````

## how it works

The server waits request on such routes:
* /customers/#id#
* /products/#id#
* /multiple/?#name1#=/customers/#id1#&#name2#=/customers/#id2#&...


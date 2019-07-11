// Requires puppeteer and chromedriver
// Hardcoded values for our testing server
const puppeteer = require('puppeteer');
const IP = '192.168.0.201';
(async () => {
    console.log('************************ Inicio Chrome Headless ');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('Chrome:', msg.text()));
    await page.goto('http://' + IP + '/');
    await page.evaluate(() => {
        document.querySelector('button[type=submit]').click();
        console.log('En Home: Botón apretado!');
    });
    await page.goto('http://' + IP + '/ventanilla');
    await page.evaluate(() => {
        document.querySelector('button[id=btnTest').click();
        document.querySelector('button[id=btnSend').click();
        console.log('En Ventanilla: Botones apretados!');
    });
    await page.screenshot({
        path: '/home/mentadev/demotren/services/frontend/source/static/log.png'
    });
    await browser.close();
    console.log('************************ Fin Chrome Headless ');
})();
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { readFile } from 'fs/promises';

const CAMINHO_CLIENT_DATA = 'src/Clients/clients.txt'


@Injectable()
export class AppService {
  async sendMessage(): Promise<any> {
    try {
      const clientsData = await readClientData();
      var phone = clientsData.map((client) => client.telefone);
      let lastMonth = new Date().getMonth() - 1;
      if (lastMonth < 0) {
        lastMonth = 12;
      }
      const message = `Olá <nome>, <empresa> gostaria de solicitar o extrato bancário do mês de ${lastMonth}. Obrigado!`;

      const browser = await puppeteer.launch({
        headless: false,
        args: [
          '--start-maximized',
        ],
        defaultViewport: null,
        executablePath: 'C://Program Files//Google//Chrome//Application//chrome.exe',
      });

      const page = await browser.newPage();

      for (let index = 0; index < phone.length; index++) {
        const currentMessage = message.replace('<nome>', clientsData[index].nome).replace('<empresa>', clientsData[index].empresa);
        await page.goto(`https://web.whatsapp.com/send?phone=+${phone[index]}&text=${encodeURIComponent(currentMessage)}`, {
          waitUntil: 'networkidle2', // Aguarda até que haja duas solicitações de rede ociosas por pelo menos 500 ms
        });
        await page.waitForResponse(response => response.url().includes('send?phone=+')); // Ajuste conforme necessário

        // Aguarde até que o botão de envio esteja pronto
        await page.waitForSelector("span[data-testid='send']", { timeout: 5000 });


        console.log(`Conectado com sucesso! Enviando mensagem para ${phone[index]}`);

        // Clique no botão de envio
        await page.click("span[data-testid='send']");

        // Aguarde até que o botão de envio esteja pronto novamente
        await page.waitForSelector("span[data-testid='send']", { timeout: 5000 });
      }

    } catch (error) {

    }
  }
}


async function readClientData() {
  try {
    const conteudo = await readFile(CAMINHO_CLIENT_DATA, { encoding: 'utf-8' });
    const linhas = conteudo.split('\r\n').filter(Boolean);

    const clientData = linhas.map((linha) => {
      const [nome, telefone, empresa] = linha.split(';');
      return { nome, telefone, empresa };
    });
    return clientData;
  } catch (error) {
    console.error(`Erro ao ler o arquivo: ${error.message}`);
    return [];
  }
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
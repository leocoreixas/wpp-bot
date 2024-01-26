import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { create } from '@wppconnect-team/wppconnect';

const CAMINHO_CLIENT_DATA = 'src/Clients/clients.txt';
const sessionName = 'session';

@Injectable()
export class AppService {
  async sendMessage(): Promise<any> {
    try {
      const clientsFromTxt = await readClientData();
      const options = {
        headless: true,
        customUserAgent:
          'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36',
        devtools: false,
        useChrome: true,
      };
      const client = await create({ session: sessionName, ...options });

      for (const clientData of clientsFromTxt) {
        const { telefone, nome, empresa } = clientData;
        const message = `Hello ${nome} from ${empresa}! This is a test message.`;
        await client.sendText(`${telefone}@c.us`, message);

        await delay(1000);
      }

      await client.close();
    } catch (error) {
      console.error(`Error: ${error.message}`);
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
    console.error(`Error reading the file: ${error.message}`);
    return [];
  }
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

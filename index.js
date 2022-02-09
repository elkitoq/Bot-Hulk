//IMPORTS
const Discord = require("discord.js");
const config = require("./config.json");
const { chromium } = require("playwright");
const axios = require("axios");
const CronJob = require("cron").CronJob;
const command = require("./command.js");
const frasesDiego = require("./frasesDiego.js");

const client = new Discord.Client();

client.on("ready", () => {
  //var generalChannel = client.channels.cache.get("789916107976343592");
  //generalChannel.send('!info para conocer los comandos')
});

client.on("message", (message) => {
  //informacion de comandos
  if (message.content === "!info") {
    const infoEmded = new Discord.MessageEmbed().addField(
      "Info Comandos",
      "**!steam**   //   Información sobre CSGO\n\n **!dolar**   //   Información sobre el dolar\n\n **!tiempo 'ciudad o provincia'** //   Que temperatura hace cualquier ciudad de argentina\n\n **!soldano**   //   Gif de perros\n\n **!macri**   //   Gif de gatos\n\n **!diego** // Para gif del DIEEEGOOOTEEEE\n\n **!gg** //  Esta gg el dia?\n\n **!frases diego**  //  Frases Iconicas del DIEGOOTEEEEE\n\n **!simpsons**  //  Frases de los simpsons\n\n **!monas chinas**  // Imagenes Monas chinas\n\n **!playlist 'Name Playlist'**  // Imagenes Monas chinas"
    );

    message.channel.send({ embed: infoEmded });
  }

  if (message.content === "!steam") {
    statusServer = steamStatus();
    statusServer.then((msj) => {
      message.channel.send(
        `El estado de Game Coordinator es: ${msj.coordinator}`
      );
      message.channel.send(`El estado de Sessions Logon es: ${msj.session}`);
      message.channel.send(
        `El estado de Player Inventories es: ${msj.inventories}`
      );
      message.channel.send(
        `El estado de Matchmaking Scheduler es: ${msj.matchmaking}`
      );
      message.channel.send(
        `El estado del servidor Buenos Aires es: ${msj.serverBAstatus} , ${msj.serverCargue}`
      );
    });
  }

  //informacion cotizacion de dolar
  if (message.content === "!dolar") {
    axios({
      method: "get",
      url: "https://api-dolar-argentina.herokuapp.com/api/dolarblue",
    })
      .then(function (response) {
        let embedDolar = new Discord.MessageEmbed();
        embedDolar.addField(
          "**El Dolar Hoy!!**",
          `La cotizacion del dolar blue para la compra en este momento es de: $${response.data.compra}\n\n La cotizacion del dolar blue para la venta en este momento es de: $${response.data.venta}`
        );
        message.channel.send(embedDolar);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  //tiempo en ciudad
  if (message.content.includes("!tiempo")) {
    messageUser = message.content.slice(8, message.content.length);
    console.log(messageUser);
    tiempo = temperatura(messageUser);
    tiempo.then((result) => {
      msj = `La temperatura actual en ${messageUser} es de: ${result}C`;
      message.channel.send(msj);
    });
  }

  //mensaje automatico con cronjob
  const job = new CronJob(
    "14 10 * * *",
    function () {
      let embedSaludo = new Discord.MessageEmbed();
      embedSaludo.addField(
        " ",
        "Queridos usuarios de Del Moro CHANNEL, les recordamos que los queremos mucho."
      );
      message.channel.send(embedSaludo);
    },
    "America/Buenos Aires"
  );
  job.start();

  //gif de perros
  if (message.content === "!soldano") {
    axios
      .get(
        "https://api.giphy.com/v1/gifs/random?api_key=bmvOZPbpuCn6koCOZaLgHskRnW0B8m9I&tag=funny-dogs&rating=g"
      )
      .then((response) => {
        message.channel.send(response.data.data.embed_url);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  //gif de gatos
  if (message.content === "!macri") {
    axios
      .get(
        "https://api.giphy.com/v1/gifs/random?api_key=bmvOZPbpuCn6koCOZaLgHskRnW0B8m9I&tag=funny-cats&rating=g"
      )
      .then((response) => {
        message.channel.send(response.data.data.embed_url);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  //gif de el diegote
  if (message.content === "!diego") {
    axios
      .get(
        "https://api.giphy.com/v1/gifs/random?api_key=bmvOZPbpuCn6koCOZaLgHskRnW0B8m9I&tag=maradona&rating=g"
      )
      .then((response) => {
        message.channel.send(response.data.data.embed_url);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  //agregar status al bot
  command(client, "status", (message) => {
    const content = message.content.replace("!status ", "");

    client.user.setPresence({
      activity: {
        name: content,
        type: 0,
      },
    });
  });

  //frases del diego
  if (message.content === "!frases diego") {
    let embedDiego = new Discord.MessageEmbed();
    embedDiego.addField(
      "**Frases del Diegote**",
      frasesDiego[Math.floor(Math.random() * frasesDiego.length)]
    );
    message.channel.send(embedDiego);
  }

  //imagenes de monas chinas
  if (message.content === "!monas chinas") {
    axios
      .get("https://waifu.pics/api/sfw/waifu")
      .then((response) => {
        message.channel.send(response.data.url);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  //frases simpsons
  if (message.content === "!simpsons") {
    axios
      .get("https://los-simpsons-quotes.herokuapp.com/v1/quotes")
      .then((response) => {
        let embedSimpsons = new Discord.MessageEmbed();
        embedSimpsons.addField(
          "**Frases de los simpsons**",
          `${response.data[0].quote}\n\nAutor: ${response.data[0].author}`
        );
        message.channel.send(embedSimpsons);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  //obtener usuarios del servidor
  if (message.content == "!gg") {
    const { memberCount } = message.guild;
    const totalUser = memberCount - 2;

    //let offline = message.guild.members.cache.filter(member => member.presence.status === "offline").size;
    let online = message.guild.members.cache.filter(
      (member) =>
        (member.presence.status === "online" && member.user.bot === false) ||
        member.presence.status === "idle" ||
        member.presence.status === "dnd"
    ).size;

    if (online === totalUser || online === totalUser - 1) {
      let embedGG = new Discord.MessageEmbed();
      embedGG.addField(
        "**Esta GG?**",
        "Hay equipo completo, y con suplentes para jogar unos tiritos"
      );
      message.channel.send(embedGG);
    } else if (online === totalUser - 2) {
      let embedGG1 = new Discord.MessageEmbed();
      embedGG1.addField(
        "**Esta GG?**",
        "Hay equipo para el cs muchache pero si se lesiona uno no hay recambio"
      );
      message.channel.send(embedGG1);
    } else if (online === totalUser - 3) {
      let embedGG2 = new Discord.MessageEmbed();
      embedGG2.addField("**Esta GG?**", "Hay CS pero jogamos con un macaco");
      message.channel.send(embedGG2);
    } else if (online === totalUser - 4) {
      let embedGG3 = new Discord.MessageEmbed();
      embedGG3.addField(
        "**Esta GG?**",
        "Hay quorum para que no nos echen pero jogamos con dos macacos como Luis"
      );
      message.channel.send(embedGG3);
    } else {
      let embedGG4 = new Discord.MessageEmbed();
      embedGG4.addField("**Esta GG?**", "Este dia esta GG padre");
      message.channel.send(embedGG4);
    }
  }

  //playlist
  if (message.content.includes("!playlist")) {
    messageUser = message.content.slice(10, message.content.length);
    formettedMessage = messageUser.replaceAll(" ", "%20");
    Playlist = lookForPlaylist(formettedMessage);
    Playlist.then((url) => message.channel.send(`.p ${url}`));
  }

  async function lookForPlaylist(playlistFormated) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(
      `https://open.spotify.com/search/${playlistFormated}/playlists`
    );
    await page.waitForTimeout(5000);
    await page.locator('[data-testid="search-category-card-0"]').click();
    await page.waitForTimeout(5000);
    const url = await page.url();
    await browser.close();
    return url;
  }

  async function steamStatus() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto("https://steamstat.us/");
    await page.waitForTimeout(2000);
    const content = {
      coordinator: await page.textContent('[id="csgo"]'),
      session: await page.textContent('[id="csgo_sessions"]'),
      inventories: await page.textContent('[id="csgo_community"]'),
      matchmaking: await page.textContent('[id="csgo_mm_scheduler"]'),
      serverBAstatus: await page.textContent('[id="eze"]'),
      serverCargue: await page.textContent('[id="csgo_argentina"]'),
    };

    await browser.close();

    return content;
  }

  async function temperatura(ciudad) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto("https://www.meteored.com.ar/");
    await page.waitForTimeout(3000);
    //await page.locator('.mendoza').click();
    await page.locator("#sendOpGdpr").click();
    await page.waitForTimeout(3000);
    await page.locator('[placeholder="El Tiempo en..."]').click();
    await page.fill('[placeholder="El Tiempo en..."]', `${ciudad}`);
    await page.keyboard.press("Enter");

    let temp = await page.textContent(".dato-temperatura");
    await browser.close();
    return temp;
  }
});

client.login(config.BOT_TOKEN);

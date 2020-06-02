const axios = require('axios');
const cheerio = require('cheerio');

const url =
  'https://strategywiki.org/wiki/Tony_Hawk%27s_Pro_Skater_2/Characters';

const getType = (str) => {
  if (str.includes('Vert')) return 'Vert';
  if (str.includes('Street')) return 'Street';
  if (str.includes('AllAround')) return 'All Around';

  return 'Unknown';
};

const getStance = (str) => {
  if (str.includes('Regular')) return 'Regular';
  if (str.includes('Goofy')) return 'Goofy';

  return 'Unknown';
};

const camelize = (str) => {
  const [first, ...bits] = str.split(' ');
  return [first.toLowerCase(), ...bits].join('');
};

const getSkaters = async () => {
  // fetch html data
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const raw = Array.from($('.mw-headline'));

  // transform html to json
  const skaters = raw.map((skater) => {
    const name = $(skater).text();

    const imgRaw = $(skater).parent().next().find('img').attr('src');
    const img = `https:${imgRaw}`;

    const typeRaw = $(skater)
      .parent()
      .next()
      .next()
      .next()
      .children()
      .first()
      .attr('href');
    const type = getType(typeRaw);

    const stanceRaw = $(skater)
      .parent()
      .next()
      .next()
      .next()
      .children()
      .first()
      .next()
      .attr('href');
    const stance = getStance(stanceRaw);

    const statsRaw = Array.from(
      $(skater).parent().next().next().next().next().find('tbody > tr')
    );

    const stats = statsRaw.reduce((acc, stat) => {
      const childrenRaw = Array.from($(stat).children());
      const children = childrenRaw.map((child) => $(child).text().trim());

      // const [key1, value1, key2, value2] = children;
      const key1 = camelize(children[0]);
      const value1 = children[1].match(/★/g).length;
      const key2 = camelize(children[2]);
      const value2 = children[3].match(/★/g).length;

      return { ...acc, [key1]: value1, [key2]: value2 };
    }, {});

    return {
      name,
      img,
      type,
      stance,
      stats,
    };
  });

  return skaters;
  // return json
};

const getSkater = async (name) => {
  const skaters = await getSkaters();
  const skater = skaters.find((s) =>
    s.name.toLowerCase().includes(name.toLowerCase())
  );
  return skater;
};

module.exports = {
  getSkaters,
  getSkater,
};

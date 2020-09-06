const wasm = require("../pkg/channel_stats");
const { getChannelStats } = require('./gather_stats');

const TILESIZE = 2 ** 10; // 1024
const MAX_VALUE = 40000;
const ITERS = 50;

const genRandom = () => {
  const length = TILESIZE ** 2;
  const random = Array
    .from({ length }, () => Math.floor(Math.random() * MAX_VALUE));
  return new Uint32Array(random);
}

function getChannelStatsWasm(arr) {
  const Stats = wasm.gather_stats(arr);
  const stats = {
    mean: Stats.mean(),
    sd: Stats.sd(),
    q1: Stats.q1(),
    median: Stats.median(),
    q3: Stats.q3(),
    domain: [Stats.domain_min(), Stats.domain_max()],
    auto_sliders: [Stats.auto_min(), Stats.auto_max()]
  };
  Stats.free();
  return stats;
}

function time(stat_fn, name, iters = ITERS) {
  const times = [];
  while (iters--) {
    const arr = genRandom();
    const start = process.hrtime();
    stat_fn(arr);
    const end = process.hrtime(start);
    times.push((end[0] * 1e9) + end[1]);
  }
  const mean = times.reduce((a, b) => a + b) / times.length;
  const sumSquared = times.reduce((a, b) => a + (b - mean)**2);
  const sd = (sumSquared / times.length) ** 0.5;

  const meanTime = (mean / 1e6).toFixed(2);
  const sdTime = (sd / 1e6).toFixed(2);
  console.log(
    `${name} \t mean=${meanTime}ms, sd=${sdTime}ms.`
  );
}

console.log(`tilesize=${TILESIZE}, iterations=${ITERS}.`)
time(getChannelStats, "js");
time(getChannelStatsWasm, "wasm");

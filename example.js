const { gather_stats }= require("./pkg/channel_stats");

const length = 1024 ** 2;
const max = 40000;
const random = Array.from({ length }, () => Math.floor(Math.random() * max));
const arr = new Uint32Array(random);
const stats = gather_stats(arr);

console.log({
  mean: stats.mean(),
  sd: stats.sd(),
  q1: stats.q1(),
  median: stats.median(),
  q3: stats.q3(),
  domain: [stats.domain_min(), stats.domain_max()],
  auto_sliders: [stats.auto_min(), stats.auto_max()]
});

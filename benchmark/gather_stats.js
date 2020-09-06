// quickselect

function quickselect(arr, k, left, right, compare) {
    quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
}

function quickselectStep(arr, k, left, right, compare) {

    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselectStep(arr, k, newLeft, newRight, compare);
        }

        var t = arr[k];
        var i = left;
        var j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

module.exports.getChannelStats = (arr) => {
  let len = arr.length;
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  // Range (min/max).
  // eslint-disable-next-line no-plusplus
  while (len--) {
    if (arr[len] < min) {
      min = arr[len];
    }
    if (arr[len] > max) {
      max = arr[len];
    }
    total += arr[len];
  }

  // Mean.
  const mean = total / arr.length;

  // Standard Deviation.
  len = arr.length;
  let sumSquared = 0;
  // eslint-disable-next-line no-plusplus
  while (len--) {
    sumSquared += (arr[len] - mean) ** 2;
  }
  const sd = (sumSquared / arr.length) ** 0.5;

  // Median, and quartiles via quickselect: https://en.wikipedia.org/wiki/Quickselect.
  // Odd number lengths should round down the index.
  const mid = Math.floor(arr.length / 2);
  const firstQuartileLocation = Math.floor(arr.length / 4);
  const thirdQuartileLocation = 3 * Math.floor(arr.length / 4);

  quickselect(arr, mid);
  const median = arr[mid];
  quickselect(arr, firstQuartileLocation, 0, mid);
  const q1 = arr[firstQuartileLocation];
  quickselect(arr, thirdQuartileLocation, mid, arr.length - 1);
  const q3 = arr[thirdQuartileLocation];

  // Used for "auto" settings.  This is the best parameter I've found experimentally.
  // I don't think there is a right answer and this feature is common in Fiji.
  // Also it's best to use a non-zero array for this.
  const cutoffArr = arr.filter(i => i >= 1);
  const cutoffPercentile = 0.0005;
  const topCutoffLocation = Math.floor(
    cutoffArr.length * (1 - cutoffPercentile)
  );
  const bottomCutoffLocation = Math.floor(
    cutoffArr.length * cutoffPercentile
  );
  quickselect(cutoffArr, topCutoffLocation);
  quickselect(cutoffArr, bottomCutoffLocation, 0, topCutoffLocation);
  const autoSliders = [
    cutoffArr[bottomCutoffLocation],
    cutoffArr[topCutoffLocation]
  ];
  return {
    mean,
    sd,
    q1,
    q3,
    median,
    data: arr,
    domain: [min, max],
    autoSliders
  };
}

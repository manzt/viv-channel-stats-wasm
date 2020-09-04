use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Stats {
    mean: f64,
    sd: f64,
    q1: f64,
    q3: f64,
    median: f64,
    domain: (f64, f64),
    auto_sliders: (f64, f64),
}

#[wasm_bindgen]
impl Stats {
    pub fn mean(&self) -> f64 {
        self.mean
    }

    pub fn sd(&self) -> f64 {
        self.sd
    }

    pub fn median(&self) -> f64 {
        self.median
    }

    pub fn q1(&self) -> f64 {
        self.q1
    }

    pub fn q3(&self) -> f64 {
        self.q3
    }

    pub fn domain_min(&self) -> f64 {
        self.domain.0
    }

    pub fn domain_max(&self) -> f64 {
        self.domain.1
    }

    pub fn auto_min(&self) -> f64 {
        self.auto_sliders.0
    }

    pub fn auto_max(&self) -> f64 {
        self.auto_sliders.1
    }
}

fn get_cutoff_arr(arr: &[u32]) -> &[u32] {
    for (i, val) in arr.iter().enumerate() {
        if val >= &1 {
            return &arr[i..];
        }
    }
    arr
}

#[wasm_bindgen]
pub fn gather_stats(arr: &mut [u32]) -> Stats {
    arr.sort();

    let length = arr.len() as f64;
    let total = arr.iter().fold(0.0, |sum, &n| sum + n as f64);
    let mean = total / length;

    let sum_squared = arr
        .iter()
        .fold(0.0, |sum, &n| sum + ((n as f64 - mean) as f64).powi(2));
    let sd = (sum_squared / length).sqrt();

    let min = arr[0];
    let max = arr[arr.len() - 1];
    let median = arr[arr.len() / 2] as f64;
    let q1 = arr[arr.len() / 4] as f64;
    let q3 = arr[3 * (arr.len() / 4)] as f64;

    let cutoff_arr = get_cutoff_arr(arr);
    let clength = cutoff_arr.len() as f64;
    let cutoff_percentile = 0.0005;
    let auto_min = cutoff_arr[(clength * cutoff_percentile).floor() as usize];
    let auto_max = cutoff_arr[(clength * (1.0 - cutoff_percentile)).floor() as usize];

    Stats {
        mean,
        sd,
        q1,
        q3,
        median,
        domain: (min as f64, max as f64),
        auto_sliders: (auto_min as f64, auto_max as f64),
    }
}

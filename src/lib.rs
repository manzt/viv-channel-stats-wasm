use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator.
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

#[wasm_bindgen]
pub fn gather_stats(arr: &mut [u32]) -> Stats {
    let length = arr.len() as f64;
    let total = arr.iter().fold(0.0, |sum, &n| sum + n as f64);
    let mean = total / length;

    let sum_squared = arr
        .iter()
        .fold(0.0, |sum, &n| sum + ((n as f64 - mean) as f64).powi(2));
    let sd = (sum_squared / length).sqrt();

    let min: f64;
    {
        let (_, value, _) = arr.select_nth_unstable(0);
        min = *value as f64;
    }

    let max: f64;
    {
        let (_, value, _) = arr.select_nth_unstable(arr.len() - 1);
        max = *value as f64;
    }

    let median: f64;
    {
        let (_, value, _) = arr.select_nth_unstable(arr.len() / 2);
        median = *value as f64;
    }

    let q1: f64;
    {
        let (_, value, _) = arr.select_nth_unstable(arr.len() / 4);
        q1 = *value as f64;
    }

    let q3: f64;
    {
        let (_, value, _) = arr.select_nth_unstable(3 * (arr.len() / 4));
        q3 = *value as f64;
    }

    let mut cutoff_arr: Vec<&u32> = arr.iter().filter(|x| x >= &&1u32).collect();
    let clength = cutoff_arr.len() as f64;
    let cutoff_percentile = 0.0005;

    let auto_min: f64;
    {
        let (_, value, _) =
            cutoff_arr.select_nth_unstable((clength * cutoff_percentile).floor() as usize);
        auto_min = **value as f64;
    }

    let auto_max: f64;
    {
        let (_, value, _) =
            cutoff_arr.select_nth_unstable((clength * (1.0 - cutoff_percentile)).floor() as usize);
        auto_max = **value as f64;
    }

    Stats {
        mean,
        sd,
        q1,
        q3,
        median,
        domain: (min, max),
        auto_sliders: (auto_min, auto_max),
    }
}

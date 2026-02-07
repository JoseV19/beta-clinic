/**
 * WHO Child Growth Standards — Boys 0-60 months (0-5 years)
 *
 * Source: World Health Organization (WHO) Child Growth Standards
 * https://www.who.int/tools/child-growth-standards/standards/weight-for-age
 * https://www.who.int/tools/child-growth-standards/standards/length-height-for-age
 *
 * Data extracted from official WHO Excel tables:
 * - wfa_boys_0-to-5-years_zscores.xlsx (weight-for-age)
 * - lhfa_boys_0-to-2-years_zscores.xlsx (length-for-age, months 0-24)
 * - lhfa_boys_2-to-5-years_zscores.xlsx (height-for-age, months 25-60)
 *
 * Z-score values: -3SD, -2SD, Median (0SD), +2SD, +3SD
 *
 * Note on length vs height: WHO measures recumbent length for children 0-24 months
 * and standing height for children 24-60 months. Standing height is approximately
 * 0.7 cm less than recumbent length. The data below uses recumbent length for
 * months 0-24 and standing height for months 25-60, as published in the official
 * WHO tables.
 */

export interface GrowthDataPoint {
  month: number
  sd3neg: number  // -3 SD
  sd2neg: number  // -2 SD
  median: number  //  0 SD (median)
  sd2pos: number  // +2 SD
  sd3pos: number  // +3 SD
}

// ---------------------------------------------------------------------------
// Weight-for-age: Boys, 0-60 months (kg)
// ---------------------------------------------------------------------------
export const weightForAgeBoys: GrowthDataPoint[] = [
  { month: 0,  sd3neg: 2.1,  sd2neg: 2.5,  median: 3.3,  sd2pos: 4.4,  sd3pos: 5.0  },
  { month: 1,  sd3neg: 2.9,  sd2neg: 3.4,  median: 4.5,  sd2pos: 5.8,  sd3pos: 6.6  },
  { month: 2,  sd3neg: 3.8,  sd2neg: 4.3,  median: 5.6,  sd2pos: 7.1,  sd3pos: 8.0  },
  { month: 3,  sd3neg: 4.4,  sd2neg: 5.0,  median: 6.4,  sd2pos: 8.0,  sd3pos: 9.0  },
  { month: 4,  sd3neg: 4.9,  sd2neg: 5.6,  median: 7.0,  sd2pos: 8.7,  sd3pos: 9.7  },
  { month: 5,  sd3neg: 5.3,  sd2neg: 6.0,  median: 7.5,  sd2pos: 9.3,  sd3pos: 10.4 },
  { month: 6,  sd3neg: 5.7,  sd2neg: 6.4,  median: 7.9,  sd2pos: 9.8,  sd3pos: 10.9 },
  { month: 7,  sd3neg: 5.9,  sd2neg: 6.7,  median: 8.3,  sd2pos: 10.3, sd3pos: 11.4 },
  { month: 8,  sd3neg: 6.2,  sd2neg: 6.9,  median: 8.6,  sd2pos: 10.7, sd3pos: 11.9 },
  { month: 9,  sd3neg: 6.4,  sd2neg: 7.1,  median: 8.9,  sd2pos: 11.0, sd3pos: 12.3 },
  { month: 10, sd3neg: 6.6,  sd2neg: 7.4,  median: 9.2,  sd2pos: 11.4, sd3pos: 12.7 },
  { month: 11, sd3neg: 6.8,  sd2neg: 7.6,  median: 9.4,  sd2pos: 11.7, sd3pos: 13.0 },
  { month: 12, sd3neg: 6.9,  sd2neg: 7.7,  median: 9.6,  sd2pos: 12.0, sd3pos: 13.3 },
  { month: 13, sd3neg: 7.1,  sd2neg: 7.9,  median: 9.9,  sd2pos: 12.3, sd3pos: 13.7 },
  { month: 14, sd3neg: 7.2,  sd2neg: 8.1,  median: 10.1, sd2pos: 12.6, sd3pos: 14.0 },
  { month: 15, sd3neg: 7.4,  sd2neg: 8.3,  median: 10.3, sd2pos: 12.8, sd3pos: 14.3 },
  { month: 16, sd3neg: 7.5,  sd2neg: 8.4,  median: 10.5, sd2pos: 13.1, sd3pos: 14.6 },
  { month: 17, sd3neg: 7.7,  sd2neg: 8.6,  median: 10.7, sd2pos: 13.4, sd3pos: 14.9 },
  { month: 18, sd3neg: 7.8,  sd2neg: 8.8,  median: 10.9, sd2pos: 13.7, sd3pos: 15.3 },
  { month: 19, sd3neg: 8.0,  sd2neg: 8.9,  median: 11.1, sd2pos: 13.9, sd3pos: 15.6 },
  { month: 20, sd3neg: 8.1,  sd2neg: 9.1,  median: 11.3, sd2pos: 14.2, sd3pos: 15.9 },
  { month: 21, sd3neg: 8.2,  sd2neg: 9.2,  median: 11.5, sd2pos: 14.5, sd3pos: 16.2 },
  { month: 22, sd3neg: 8.4,  sd2neg: 9.4,  median: 11.8, sd2pos: 14.7, sd3pos: 16.5 },
  { month: 23, sd3neg: 8.5,  sd2neg: 9.5,  median: 12.0, sd2pos: 15.0, sd3pos: 16.8 },
  { month: 24, sd3neg: 8.6,  sd2neg: 9.7,  median: 12.2, sd2pos: 15.3, sd3pos: 17.1 },
  { month: 25, sd3neg: 8.8,  sd2neg: 9.8,  median: 12.4, sd2pos: 15.5, sd3pos: 17.5 },
  { month: 26, sd3neg: 8.9,  sd2neg: 10.0, median: 12.5, sd2pos: 15.8, sd3pos: 17.8 },
  { month: 27, sd3neg: 9.0,  sd2neg: 10.1, median: 12.7, sd2pos: 16.1, sd3pos: 18.1 },
  { month: 28, sd3neg: 9.1,  sd2neg: 10.2, median: 12.9, sd2pos: 16.3, sd3pos: 18.4 },
  { month: 29, sd3neg: 9.2,  sd2neg: 10.4, median: 13.1, sd2pos: 16.6, sd3pos: 18.7 },
  { month: 30, sd3neg: 9.4,  sd2neg: 10.5, median: 13.3, sd2pos: 16.9, sd3pos: 19.0 },
  { month: 31, sd3neg: 9.5,  sd2neg: 10.7, median: 13.5, sd2pos: 17.1, sd3pos: 19.3 },
  { month: 32, sd3neg: 9.6,  sd2neg: 10.8, median: 13.7, sd2pos: 17.4, sd3pos: 19.6 },
  { month: 33, sd3neg: 9.7,  sd2neg: 10.9, median: 13.8, sd2pos: 17.6, sd3pos: 19.9 },
  { month: 34, sd3neg: 9.8,  sd2neg: 11.0, median: 14.0, sd2pos: 17.8, sd3pos: 20.2 },
  { month: 35, sd3neg: 9.9,  sd2neg: 11.2, median: 14.2, sd2pos: 18.1, sd3pos: 20.4 },
  { month: 36, sd3neg: 10.0, sd2neg: 11.3, median: 14.3, sd2pos: 18.3, sd3pos: 20.7 },
  { month: 37, sd3neg: 10.1, sd2neg: 11.4, median: 14.5, sd2pos: 18.6, sd3pos: 21.0 },
  { month: 38, sd3neg: 10.2, sd2neg: 11.5, median: 14.7, sd2pos: 18.8, sd3pos: 21.3 },
  { month: 39, sd3neg: 10.3, sd2neg: 11.6, median: 14.8, sd2pos: 19.0, sd3pos: 21.6 },
  { month: 40, sd3neg: 10.4, sd2neg: 11.8, median: 15.0, sd2pos: 19.3, sd3pos: 21.9 },
  { month: 41, sd3neg: 10.5, sd2neg: 11.9, median: 15.2, sd2pos: 19.5, sd3pos: 22.1 },
  { month: 42, sd3neg: 10.6, sd2neg: 12.0, median: 15.3, sd2pos: 19.7, sd3pos: 22.4 },
  { month: 43, sd3neg: 10.7, sd2neg: 12.1, median: 15.5, sd2pos: 20.0, sd3pos: 22.7 },
  { month: 44, sd3neg: 10.8, sd2neg: 12.2, median: 15.7, sd2pos: 20.2, sd3pos: 23.0 },
  { month: 45, sd3neg: 10.9, sd2neg: 12.4, median: 15.8, sd2pos: 20.5, sd3pos: 23.3 },
  { month: 46, sd3neg: 11.0, sd2neg: 12.5, median: 16.0, sd2pos: 20.7, sd3pos: 23.6 },
  { month: 47, sd3neg: 11.1, sd2neg: 12.6, median: 16.2, sd2pos: 20.9, sd3pos: 23.9 },
  { month: 48, sd3neg: 11.2, sd2neg: 12.7, median: 16.3, sd2pos: 21.2, sd3pos: 24.2 },
  { month: 49, sd3neg: 11.3, sd2neg: 12.8, median: 16.5, sd2pos: 21.4, sd3pos: 24.5 },
  { month: 50, sd3neg: 11.4, sd2neg: 12.9, median: 16.7, sd2pos: 21.7, sd3pos: 24.8 },
  { month: 51, sd3neg: 11.5, sd2neg: 13.1, median: 16.8, sd2pos: 21.9, sd3pos: 25.1 },
  { month: 52, sd3neg: 11.6, sd2neg: 13.2, median: 17.0, sd2pos: 22.2, sd3pos: 25.4 },
  { month: 53, sd3neg: 11.7, sd2neg: 13.3, median: 17.2, sd2pos: 22.4, sd3pos: 25.7 },
  { month: 54, sd3neg: 11.8, sd2neg: 13.4, median: 17.3, sd2pos: 22.7, sd3pos: 26.0 },
  { month: 55, sd3neg: 11.9, sd2neg: 13.5, median: 17.5, sd2pos: 22.9, sd3pos: 26.3 },
  { month: 56, sd3neg: 12.0, sd2neg: 13.6, median: 17.7, sd2pos: 23.2, sd3pos: 26.6 },
  { month: 57, sd3neg: 12.1, sd2neg: 13.7, median: 17.8, sd2pos: 23.4, sd3pos: 26.9 },
  { month: 58, sd3neg: 12.2, sd2neg: 13.8, median: 18.0, sd2pos: 23.7, sd3pos: 27.2 },
  { month: 59, sd3neg: 12.3, sd2neg: 14.0, median: 18.2, sd2pos: 23.9, sd3pos: 27.6 },
  { month: 60, sd3neg: 12.4, sd2neg: 14.1, median: 18.3, sd2pos: 24.2, sd3pos: 27.9 },
]

// ---------------------------------------------------------------------------
// Length/Height-for-age: Boys, 0-60 months (cm)
//
// Months 0-24: recumbent length (from lhfa_boys_0-to-2-years_zscores.xlsx)
// Months 25-60: standing height (from lhfa_boys_2-to-5-years_zscores.xlsx)
// ---------------------------------------------------------------------------
export const lengthHeightForAgeBoys: GrowthDataPoint[] = [
  { month: 0,  sd3neg: 44.2, sd2neg: 46.1, median: 49.9, sd2pos: 53.7, sd3pos: 55.6 },
  { month: 1,  sd3neg: 48.9, sd2neg: 50.8, median: 54.7, sd2pos: 58.6, sd3pos: 60.6 },
  { month: 2,  sd3neg: 52.4, sd2neg: 54.4, median: 58.4, sd2pos: 62.4, sd3pos: 64.4 },
  { month: 3,  sd3neg: 55.3, sd2neg: 57.3, median: 61.4, sd2pos: 65.5, sd3pos: 67.6 },
  { month: 4,  sd3neg: 57.6, sd2neg: 59.7, median: 63.9, sd2pos: 68.0, sd3pos: 70.1 },
  { month: 5,  sd3neg: 59.6, sd2neg: 61.7, median: 65.9, sd2pos: 70.1, sd3pos: 72.2 },
  { month: 6,  sd3neg: 61.2, sd2neg: 63.3, median: 67.6, sd2pos: 71.9, sd3pos: 74.0 },
  { month: 7,  sd3neg: 62.7, sd2neg: 64.8, median: 69.2, sd2pos: 73.5, sd3pos: 75.7 },
  { month: 8,  sd3neg: 64.0, sd2neg: 66.2, median: 70.6, sd2pos: 75.0, sd3pos: 77.2 },
  { month: 9,  sd3neg: 65.2, sd2neg: 67.5, median: 72.0, sd2pos: 76.5, sd3pos: 78.7 },
  { month: 10, sd3neg: 66.4, sd2neg: 68.7, median: 73.3, sd2pos: 77.9, sd3pos: 80.1 },
  { month: 11, sd3neg: 67.6, sd2neg: 69.9, median: 74.5, sd2pos: 79.2, sd3pos: 81.5 },
  { month: 12, sd3neg: 68.6, sd2neg: 71.0, median: 75.7, sd2pos: 80.5, sd3pos: 82.9 },
  { month: 13, sd3neg: 69.6, sd2neg: 72.1, median: 76.9, sd2pos: 81.8, sd3pos: 84.2 },
  { month: 14, sd3neg: 70.6, sd2neg: 73.1, median: 78.0, sd2pos: 83.0, sd3pos: 85.5 },
  { month: 15, sd3neg: 71.6, sd2neg: 74.1, median: 79.1, sd2pos: 84.2, sd3pos: 86.7 },
  { month: 16, sd3neg: 72.5, sd2neg: 75.0, median: 80.2, sd2pos: 85.4, sd3pos: 88.0 },
  { month: 17, sd3neg: 73.3, sd2neg: 76.0, median: 81.2, sd2pos: 86.5, sd3pos: 89.2 },
  { month: 18, sd3neg: 74.2, sd2neg: 76.9, median: 82.3, sd2pos: 87.7, sd3pos: 90.4 },
  { month: 19, sd3neg: 75.0, sd2neg: 77.7, median: 83.2, sd2pos: 88.8, sd3pos: 91.5 },
  { month: 20, sd3neg: 75.8, sd2neg: 78.6, median: 84.2, sd2pos: 89.8, sd3pos: 92.6 },
  { month: 21, sd3neg: 76.5, sd2neg: 79.4, median: 85.1, sd2pos: 90.9, sd3pos: 93.8 },
  { month: 22, sd3neg: 77.2, sd2neg: 80.2, median: 86.0, sd2pos: 91.9, sd3pos: 94.9 },
  { month: 23, sd3neg: 78.0, sd2neg: 81.0, median: 86.9, sd2pos: 92.9, sd3pos: 95.9 },
  { month: 24, sd3neg: 78.7, sd2neg: 81.7, median: 87.8, sd2pos: 93.9, sd3pos: 97.0 },
  // Standing height from month 25 onward (WHO height-for-age, 2-5 years table)
  { month: 25, sd3neg: 78.6, sd2neg: 81.7, median: 88.0, sd2pos: 94.2, sd3pos: 97.3 },
  { month: 26, sd3neg: 79.3, sd2neg: 82.5, median: 88.8, sd2pos: 95.2, sd3pos: 98.3 },
  { month: 27, sd3neg: 79.9, sd2neg: 83.1, median: 89.6, sd2pos: 96.1, sd3pos: 99.3 },
  { month: 28, sd3neg: 80.5, sd2neg: 83.8, median: 90.4, sd2pos: 97.0, sd3pos: 100.3 },
  { month: 29, sd3neg: 81.1, sd2neg: 84.5, median: 91.2, sd2pos: 97.9, sd3pos: 101.2 },
  { month: 30, sd3neg: 81.7, sd2neg: 85.1, median: 91.9, sd2pos: 98.7, sd3pos: 102.1 },
  { month: 31, sd3neg: 82.3, sd2neg: 85.7, median: 92.7, sd2pos: 99.6, sd3pos: 103.0 },
  { month: 32, sd3neg: 82.8, sd2neg: 86.4, median: 93.4, sd2pos: 100.4, sd3pos: 103.9 },
  { month: 33, sd3neg: 83.4, sd2neg: 86.9, median: 94.1, sd2pos: 101.2, sd3pos: 104.8 },
  { month: 34, sd3neg: 83.9, sd2neg: 87.5, median: 94.8, sd2pos: 102.0, sd3pos: 105.6 },
  { month: 35, sd3neg: 84.4, sd2neg: 88.1, median: 95.4, sd2pos: 102.7, sd3pos: 106.4 },
  { month: 36, sd3neg: 85.0, sd2neg: 88.7, median: 96.1, sd2pos: 103.5, sd3pos: 107.2 },
  { month: 37, sd3neg: 85.5, sd2neg: 89.2, median: 96.7, sd2pos: 104.2, sd3pos: 108.0 },
  { month: 38, sd3neg: 86.0, sd2neg: 89.8, median: 97.4, sd2pos: 105.0, sd3pos: 108.8 },
  { month: 39, sd3neg: 86.5, sd2neg: 90.3, median: 98.0, sd2pos: 105.7, sd3pos: 109.5 },
  { month: 40, sd3neg: 87.0, sd2neg: 90.9, median: 98.6, sd2pos: 106.4, sd3pos: 110.3 },
  { month: 41, sd3neg: 87.5, sd2neg: 91.4, median: 99.2, sd2pos: 107.1, sd3pos: 111.0 },
  { month: 42, sd3neg: 88.0, sd2neg: 91.9, median: 99.9, sd2pos: 107.8, sd3pos: 111.7 },
  { month: 43, sd3neg: 88.4, sd2neg: 92.4, median: 100.4, sd2pos: 108.5, sd3pos: 112.5 },
  { month: 44, sd3neg: 88.9, sd2neg: 93.0, median: 101.0, sd2pos: 109.1, sd3pos: 113.2 },
  { month: 45, sd3neg: 89.4, sd2neg: 93.5, median: 101.6, sd2pos: 109.8, sd3pos: 113.9 },
  { month: 46, sd3neg: 89.8, sd2neg: 94.0, median: 102.2, sd2pos: 110.4, sd3pos: 114.6 },
  { month: 47, sd3neg: 90.3, sd2neg: 94.4, median: 102.8, sd2pos: 111.1, sd3pos: 115.2 },
  { month: 48, sd3neg: 90.7, sd2neg: 94.9, median: 103.3, sd2pos: 111.7, sd3pos: 115.9 },
  { month: 49, sd3neg: 91.2, sd2neg: 95.4, median: 103.9, sd2pos: 112.4, sd3pos: 116.6 },
  { month: 50, sd3neg: 91.6, sd2neg: 95.9, median: 104.4, sd2pos: 113.0, sd3pos: 117.3 },
  { month: 51, sd3neg: 92.1, sd2neg: 96.4, median: 105.0, sd2pos: 113.6, sd3pos: 117.9 },
  { month: 52, sd3neg: 92.5, sd2neg: 96.9, median: 105.6, sd2pos: 114.2, sd3pos: 118.6 },
  { month: 53, sd3neg: 93.0, sd2neg: 97.4, median: 106.1, sd2pos: 114.9, sd3pos: 119.2 },
  { month: 54, sd3neg: 93.4, sd2neg: 97.8, median: 106.7, sd2pos: 115.5, sd3pos: 119.9 },
  { month: 55, sd3neg: 93.9, sd2neg: 98.3, median: 107.2, sd2pos: 116.1, sd3pos: 120.6 },
  { month: 56, sd3neg: 94.3, sd2neg: 98.8, median: 107.8, sd2pos: 116.7, sd3pos: 121.2 },
  { month: 57, sd3neg: 94.7, sd2neg: 99.3, median: 108.3, sd2pos: 117.4, sd3pos: 121.9 },
  { month: 58, sd3neg: 95.2, sd2neg: 99.7, median: 108.9, sd2pos: 118.0, sd3pos: 122.6 },
  { month: 59, sd3neg: 95.6, sd2neg: 100.2, median: 109.4, sd2pos: 118.6, sd3pos: 123.2 },
  { month: 60, sd3neg: 96.1, sd2neg: 100.7, median: 110.0, sd2pos: 119.2, sd3pos: 123.9 },
]

export function chartGeometry(
  values: number[],
  w: number,
  h: number,
  sharedMax?: number,
  offsetX = 0
): { line: string; area: string } {
  const n = values.length;
  const max = sharedMax ?? Math.max(...values, 1);
  if (n < 2 || max <= 0) return { line: "", area: "" };

  const step = w / (n - 1);
  const pts = values.map((v, i) => [
    offsetX + i * step,
    h - (v / max) * (h - 2) - 1,
  ]);

  let line = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    line += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }

  const area = `${line} L ${pts[pts.length - 1][0]},${h} L ${pts[0][0]},${h} Z`;
  return { line, area };
}

/**
 * Compute a "nice" Y-axis max and tick values.
 * Returns { max, ticks } where ticks are evenly spaced from 0 to max.
 */
export function niceScale(dataMax: number, targetTicks = 5): {
  max: number;
  ticks: number[];
} {
  if (dataMax <= 0) return { max: 10, ticks: [0, 2, 4, 6, 8, 10] };

  const rawStep = dataMax / (targetTicks - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / mag;

  let niceStep: number;
  if (residual <= 1) niceStep = 1 * mag;
  else if (residual <= 2) niceStep = 2 * mag;
  else if (residual <= 2.5) niceStep = 2.5 * mag;
  else if (residual <= 5) niceStep = 5 * mag;
  else niceStep = 10 * mag;

  const max = Math.ceil(dataMax / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let v = 0; v <= max + niceStep * 0.01; v += niceStep) {
    ticks.push(Math.round(v * 1000) / 1000); // avoid floating point dust
  }
  return { max, ticks };
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

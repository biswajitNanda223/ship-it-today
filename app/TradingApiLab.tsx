"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Candle = { open: number; high: number; low: number; close: number; volume: number };

function seedCandles(): Candle[] {
  let price = 184.2;
  return Array.from({ length: 48 }, (_, index) => {
    const drift = Math.sin(index * .62) * .42 + Math.cos(index * .21) * .18;
    const open = price;
    const close = open + drift;
    price = close;
    return { open, close, high: Math.max(open, close) + .24 + (index % 4) * .06, low: Math.min(open, close) - .2 - (index % 3) * .05, volume: 38 + (index * 17) % 66 };
  });
}

const INITIAL_CANDLES = seedCandles();
const INITIAL_PRICE = INITIAL_CANDLES.at(-1)?.close ?? 186.42;

export function TradingApiLab() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const data = useRef(INITIAL_CANDLES);
  const [price, setPrice] = useState(INITIAL_PRICE);
  const [ticks, setTicks] = useState(12480);

  useEffect(() => {
    const draw = () => {
      const element = canvas.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(bounds.width * ratio);
      element.height = Math.round(bounds.height * ratio);
      const context = element.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const width = bounds.width;
      const height = bounds.height;
      const chartHeight = height * .76;
      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(255,255,255,.07)";
      for (let row = 0; row <= 5; row++) {
        const y = 18 + row * (chartHeight - 28) / 5;
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
      }
      const candles = data.current;
      const min = Math.min(...candles.map(item => item.low));
      const max = Math.max(...candles.map(item => item.high));
      const mapY = (value: number) => 12 + (max - value) / (max - min || 1) * (chartHeight - 24);
      const step = width / candles.length;
      candles.forEach((item, index) => {
        const x = index * step + step / 2;
        const rising = item.close >= item.open;
        context.strokeStyle = rising ? "#77e7a5" : "#ff6f7d";
        context.fillStyle = rising ? "#77e7a5" : "#ff6f7d";
        context.beginPath(); context.moveTo(x, mapY(item.high)); context.lineTo(x, mapY(item.low)); context.stroke();
        const top = mapY(Math.max(item.open, item.close));
        const bottom = mapY(Math.min(item.open, item.close));
        context.fillRect(x - Math.max(2, step * .25), top, Math.max(3, step * .5), Math.max(2, bottom - top));
        const volumeHeight = (item.volume / 110) * (height - chartHeight - 12);
        context.globalAlpha = .22;
        context.fillRect(x - Math.max(2, step * .28), height - volumeHeight, Math.max(3, step * .56), volumeHeight);
        context.globalAlpha = 1;
      });
      const lastY = mapY(candles.at(-1)?.close ?? 0);
      context.strokeStyle = "#c8ff3d";
      context.setLineDash([5, 5]);
      context.beginPath(); context.moveTo(0, lastY); context.lineTo(width, lastY); context.stroke();
      context.setLineDash([]);
    };

    draw();
    const resize = new ResizeObserver(draw);
    if (canvas.current) resize.observe(canvas.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = reduce ? undefined : window.setInterval(() => {
      const candles = data.current;
      const last = candles.at(-1)?.close ?? 186;
      const movement = (Math.random() - .47) * .72;
      const next = { open: last, close: last + movement, high: last + Math.max(.18, movement + .16), low: last + Math.min(-.18, movement - .14), volume: 35 + Math.random() * 72 };
      data.current = [...candles.slice(1), next];
      setPrice(next.close);
      setTicks(value => value + Math.round(180 + Math.random() * 420));
      draw();
    }, 850);
    return () => { resize.disconnect(); if (timer) window.clearInterval(timer); };
  }, []);

  const bids = [0.02, 0.05, 0.08, 0.12, 0.17].map((gap, index) => ({ price: price - gap, size: 12.4 + index * 7.83 }));
  const asks = [0.17, 0.12, 0.08, 0.05, 0.02].map((gap, index) => ({ price: price + gap, size: 10.7 + (4 - index) * 8.21 }));

  return <section className="trading-lab"><div className="shell"><header className="trading-head"><div><span className="kicker">LIVE TRADING API BLUEPRINT</span><h2>Market data at<br/><em>wire speed.</em></h2></div><p>Watch a simulated WebSocket feed update candles and the order book while REST handles snapshots and orders. The visualization uses local demo data.</p></header><div className="trading-terminal"><div className="ticker-strip"><b>SHIP / USD</b><strong>${price.toFixed(2)}</strong><span className="up">+2.84%</span><span>24H VOL <b>$48.7M</b></span><span>FEED <b>WS / 42ms</b></span><i>LIVE</i></div><div className="market-chart"><canvas ref={canvas} aria-label="Live simulated SHIP USD candlestick and volume chart"/><div className="chart-hud"><span>1m</span><b>OHLC + VOLUME</b><small>{ticks.toLocaleString()} ticks processed</small></div></div><aside className="order-book"><header><b>ORDER BOOK</b><span>0.01 USD</span></header><div className="book-labels"><span>PRICE</span><span>SIZE</span></div>{asks.map((row, index) => <div className="ask" key={`ask-${index}`} style={{ "--depth": `${28 + index * 13}%` } as CSSProperties}><b>{row.price.toFixed(2)}</b><span>{row.size.toFixed(2)}</span></div>)}<strong>${price.toFixed(2)} <small>mid price</small></strong>{bids.map((row, index) => <div className="bid" key={`bid-${index}`} style={{ "--depth": `${86 - index * 12}%` } as CSSProperties}><b>{row.price.toFixed(2)}</b><span>{row.size.toFixed(2)}</span></div>)}</aside><div className="trade-api-flow"><div><span>01</span><b>Exchange feed</b><small>binary WebSocket frames</small></div><i>→</i><div><span>02</span><b>Normalizer</b><small>sequence + deduplication</small></div><i>→</i><div><span>03</span><b>Kafka log</b><small>partition by symbol</small></div><i>→</i><div><span>04</span><b>Fan-out gateway</b><small>backpressure + resume</small></div><i>→</i><div><span>05</span><b>Web client</b><small>batched canvas render</small></div></div><footer><code>GET /v1/markets/SHIP-USD/candles?interval=1m</code><code>WS /v1/markets/SHIP-USD/stream</code><code>POST /v1/orders · Idempotency-Key</code></footer></div></div></section>;
}

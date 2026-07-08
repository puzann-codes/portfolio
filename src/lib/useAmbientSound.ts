"use client";

import { useCallback, useEffect, useRef } from "react";

type PadGraph = {
  masterGain: GainNode;
  padGain: GainNode;
  noiseGain: GainNode;
  noiseFilter: BiquadFilterNode;
  osc1: OscillatorNode;
  osc2: OscillatorNode;
};

// Ambient sound for the spiral gallery: a soft, warm pad — two low sine
// tones a fifth apart, gently vibrato'd, tailed by a short feedback delay
// for a bit of shimmer/space — that swells in pitch and volume with the
// conveyor's speed, plus a thin resonant-filtered noise layer underneath
// for a sense of air/movement. The idea is "satisfying hum", not "wind
// machine": low, rounded, and inviting rather than hissy. A separate,
// brighter tick plays on card hovers. Everything is generated live with
// the Web Audio API — no audio files — and stays fully dormant until the
// user opts in via the mute toggle (autoplay policy, and unsolicited sound
// on load is bad manners regardless).
export function useAmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const graphRef = useRef<PadGraph | null>(null);
  const enabledRef = useRef(false);

  const ensureGraph = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioContextCtor();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(ctx.destination);

    // a short feedback delay gives the pad a bit of shimmer/tail instead of
    // sounding dry and flat — the thing that makes it feel worth lingering
    // on rather than just functional
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.24;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 1800;
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delayFilter.connect(masterGain);

    // the pad itself: root + a fifth above, both low and rounded, with a
    // slow shared vibrato so it feels alive rather than a static drone
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 900;
    const padGain = ctx.createGain();
    padGain.gain.value = 0;
    padFilter.connect(padGain);
    padGain.connect(masterGain);
    padGain.connect(delay);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 96;
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 96 * 1.5;
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.55;
    osc1.connect(padFilter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(padFilter);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 2.4;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    osc1.start();
    osc2.start();
    lfo.start();

    // thin layer of resonant-filtered noise underneath for a sense of air
    // and motion — quiet and narrow-band so it reads as texture, not hiss
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 500;
    noiseFilter.Q.value = 2.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
    noise.start();

    ctxRef.current = ctx;
    graphRef.current = { masterGain, padGain, noiseGain, noiseFilter, osc1, osc2 };
    return ctx;
  }, []);

  const enable = useCallback(() => {
    const ctx = ensureGraph();
    if (ctx.state === "suspended") ctx.resume();
    enabledRef.current = true;
  }, [ensureGraph]);

  const disable = useCallback(() => {
    enabledRef.current = false;
    const ctx = ctxRef.current;
    const graph = graphRef.current;
    if (ctx && graph) {
      graph.padGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      graph.noiseGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    }
  }, []);

  // called every animation frame with the conveyor's current speed; every
  // parameter glides with a fairly long time constant so changes feel like
  // a swell rather than a jump — soothing, not reactive/twitchy
  const setIntensity = useCallback((speed: number) => {
    const ctx = ctxRef.current;
    const graph = graphRef.current;
    if (!ctx || !graph || !enabledRef.current) return;
    const clamped = Math.min(1, Math.max(0, (Math.abs(speed) - 0.008) / 0.09));
    const now = ctx.currentTime;
    const glide = 0.35;

    graph.padGain.gain.setTargetAtTime(0.05 + clamped * 0.075, now, glide);
    graph.osc1.frequency.setTargetAtTime(96 + clamped * 70, now, glide);
    graph.osc2.frequency.setTargetAtTime((96 + clamped * 70) * 1.5, now, glide);

    graph.noiseGain.gain.setTargetAtTime(0.01 + clamped * 0.035, now, glide);
    graph.noiseFilter.frequency.setTargetAtTime(400 + clamped * 900, now, glide);
  }, []);

  const playTick = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    // a soft, low, rounded tap — gentle linear attack (no harsh transient),
    // gliding down half an octave and fading out over ~170ms. Quiet on
    // purpose: this should read as a subtle acknowledgment, not a UI blip
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    osc.type = "sine";
    osc.frequency.setValueAtTime(340 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.15);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.032, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(filter).connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }, []);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return { enable, disable, setIntensity, playTick };
}

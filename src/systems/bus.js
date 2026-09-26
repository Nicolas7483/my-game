// One tiny event bus shared by every scene (toasts, sound cues, world changes...).
// Plain JS (no Phaser) so the content simulator can run it in Node.
class Bus {
  constructor() { this.l = new Map(); }
  on(ev, fn, ctx, once = false) { if (!this.l.has(ev)) this.l.set(ev, []); this.l.get(ev).push({ fn, ctx, once }); return this; }
  once(ev, fn, ctx) { return this.on(ev, fn, ctx, true); }
  off(ev, fn, ctx) {
    const a = this.l.get(ev); if (!a) return this;
    this.l.set(ev, a.filter(x => !(x.fn === fn && (ctx === undefined || x.ctx === ctx))));
    return this;
  }
  emit(ev, ...args) {
    const a = this.l.get(ev); if (!a) return false;
    this.l.set(ev, a.filter(x => !x.once));
    for (const x of [...a]) x.fn.apply(x.ctx, args);
    return true;
  }
  removeAllListeners(ev) { if (ev) this.l.delete(ev); else this.l.clear(); return this; }
}
export const bus = new Bus();
